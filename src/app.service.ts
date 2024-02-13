import { Injectable, Logger } from '@nestjs/common';
import { Sequelize, DataTypes, Model } from 'sequelize';
import { ShortenUrlDto, ShortenedUrlResponseDto, UpdateUrlDto } from './dto';
import { AliasConflictException, DeletedLinkException, EmptyShortUrlException, InvalidRequestLimitException, InvalidURLException, RequestLimitReachedException, ShortUrlNotFoundException, ShortUrlOrAliasNotFoundException } from './exceptions';


export class URLMap extends Model {
  public id!: number;
  public shortURL!: string;
  public longURL!: string;
  public visitorCount!: number; 
  public aliasURL!: string | null; 
  public isActive!: boolean; 
  public requestLimit!: number; 
}

@Injectable()
export class AppService {
  private sequelize: Sequelize;
  private urlMap: typeof URLMap;
  private readonly logger = new Logger(AppService.name);

  constructor() {
    // Initialize Sequelize
    this.sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: 'database.sqlite', // or :memory:
    });

    // Define the URLMap model
    URLMap.init({
      shortURL: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      longURL: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      visitorCount: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      aliasURL: { 
        type: DataTypes.STRING,
        allowNull: true, // Nullable
        unique: true, // Unique constraint
      },
      isActive: { 
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      requestLimit: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    }, {
      sequelize: this.sequelize,
      modelName: 'URLMap',
      indexes: [
        {
          unique: true,
          fields: ['shortURL'],
        },
        {
          unique: true,
          fields: ['aliasURL'],
        },
      ],
    });

    // Synchronize the model with the database
    this.sequelize.sync();

    this.urlMap = URLMap;
  }

  getHello(): string {
    return 'Hello World!';
  }

  private isValidUrl(url: string): boolean {
    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return urlRegex.test(url);
  }

  private async findMapByShortUrlAndAlias(shortUrl: string): Promise<URLMap | null> {
    let map = await this.urlMap.findOne({ where: { shortUrl } });
    if (!map) {
      map = await this.urlMap.findOne({ where: { aliasURL: shortUrl } });
    }
    return map;
  }

  async shortenUrl(dto: ShortenUrlDto): Promise<ShortenedUrlResponseDto> { // Default requestLimit to 0
    if (!this.isValidUrl(dto.longUrl)) {
      throw new InvalidURLException();
    }

    if (dto.requestLimit !=null && dto.requestLimit < 0) {
      throw new InvalidRequestLimitException();
    }
    // Check if aliasURL exists in shortURL
    const existingMap = await this.urlMap.findOne({ where: { shortURL: dto.aliasURL } });
    if (existingMap) {
      throw new AliasConflictException();
    }
    // Generate short URL and store mapping with requestLimit
    const shortUrl = [...Array(5)].map(() => Math.random().toString(36)[2]).join('');
    await this.urlMap.create({
      shortURL: shortUrl,
      longURL: dto.longUrl,
      visitorCount: 0,
      aliasURL: dto.aliasURL || null,
      requestLimit: dto.requestLimit, // Include requestLimit
    });
    this.logger.log(`URL shortened: ${dto.longUrl} -> ${shortUrl}`);
    return { shortUrl };
  }

  async getOriginalUrl(shortUrl: string, ipAddress: string): Promise<string> {
    const map = await this.findMapByShortUrlAndAlias(shortUrl);
    if (!map) {
      throw new ShortUrlOrAliasNotFoundException();
    }

    // Check if requestLimit is set and if the visitorCount has reached the limit
    if (map.requestLimit && map.visitorCount >= map.requestLimit) {
      throw new RequestLimitReachedException();
    }

    // Check if the URL is active
    if (!map.isActive) {
      throw new DeletedLinkException();
    }

    // Update statistics
    await map.increment('visitorCount');
    // You can add more detailed statistics like access location, user, etc.
    this.logger.log(`Redirecting to original URL: ${shortUrl} -> ${map.longURL}`);
    return map.longURL;
  }

  async getStatistics(shortUrl: string): Promise<any> {
    const map = await this.findMapByShortUrlAndAlias(shortUrl);
    if (!map) {
      throw new ShortUrlOrAliasNotFoundException();
    }
    this.logger.log(`Retrieved statistics for URL: ${shortUrl}`);
    return map;
  }

  async getAllURLs(): Promise<URLMap[]> {
    // Retrieve all records from the URLMap table
    this.logger.log(`Retrieving all URLs`);
    return await this.urlMap.findAll();
  }

  async updateUrlMap(updateUrlDto: UpdateUrlDto): Promise<string> {
    const { shortURL, requestLimit, alias } = updateUrlDto;

    // Find the URLMap entry
    const urlMapEntry = await this.urlMap.findOne({ where: { shortURL } });

    if (!urlMapEntry) {
      throw new ShortUrlNotFoundException();
    }

    // Update the URLMap entry
    if (requestLimit !== undefined) {
      if (requestLimit < 0) {
        throw new InvalidRequestLimitException();
      }
      urlMapEntry.requestLimit = requestLimit;
    }

    // Check if alias is provided and conflicts with existing shortURL
    if (alias) {
      const existingMap = await this.urlMap.findOne({ where: { shortURL: alias } });
      if (existingMap) {
        throw new AliasConflictException();
      }
      urlMapEntry.aliasURL = alias;
  }

    // Save changes
   await urlMapEntry.save();
    this.logger.log(`URL updated: ${shortURL}`);
    return 'URL updated successfully';
  }

  async deleteUrlMap(shortURL: string): Promise<string> {
    const urlMapEntry = await this.urlMap.findOne({ where: { shortURL } });
    if (!urlMapEntry) {
      throw new ShortUrlNotFoundException();
    }
    // Set isActive to false
    urlMapEntry.isActive = false;
    await urlMapEntry.save();
    this.logger.log(`URL deleted: ${shortURL}`);
    return 'URL deleted successfully';
  }
}
