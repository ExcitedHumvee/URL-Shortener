import { Injectable, Logger } from '@nestjs/common';
import { Sequelize, DataTypes, Model, Transaction } from 'sequelize';
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
      logging: false,
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

  async onModuleDestroy() {
    // Close the database connection when the module is destroyed
    await this.sequelize.close();
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

  async shortenUrl(dto: ShortenUrlDto): Promise<ShortenedUrlResponseDto> {
    if (!this.isValidUrl(dto.longUrl)) {
      throw new InvalidURLException();
    }

    if (dto.requestLimit != null && dto.requestLimit < 0) {
      throw new InvalidRequestLimitException();
    }

    let transaction: Transaction;
    try {
      // Begin transaction
      transaction = await this.sequelize.transaction();

      // Check if aliasURL exists in shortURL
      const existingMap = await this.urlMap.findOne({ where: { shortURL: dto.aliasURL }, transaction });
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
      }, { transaction });

      // Commit transaction
      await transaction.commit();

      this.logger.log(`URL shortened: ${dto.longUrl} -> ${shortUrl}`);
      return { shortUrl };
    } catch (error) {
      // Rollback transaction on error
      if (transaction) await transaction.rollback();
      throw error;
    }
  }


  async getOriginalUrl(shortUrl: string, ipAddress: string): Promise<string> {
    const map = await this.findMapByShortUrlAndAlias(shortUrl);
    if (!map) {
      throw new ShortUrlOrAliasNotFoundException();
    }

    // Check if the URL is active
    if (!map.isActive) {
      throw new DeletedLinkException();
    }

    // Check if requestLimit is set and if the visitorCount has reached the limit
    if (map.requestLimit && map.visitorCount >= map.requestLimit) {
      throw new RequestLimitReachedException();
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
    let transaction: Transaction;
    try {
      // Begin transaction
      transaction = await this.sequelize.transaction();

      const urlMapEntry = await this.urlMap.findOne({ where: { shortURL }, transaction }); // Fix here
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
        const existingMap = await this.urlMap.findOne({ where: { shortURL: alias }, transaction }); // Fix here
        if (existingMap) {
          throw new AliasConflictException();
        }
        urlMapEntry.aliasURL = alias;
      }

      // Save changes
      await urlMapEntry.save({ transaction });

      // Commit transaction
      await transaction.commit();

      this.logger.log(`URL updated: ${shortURL}`);
      return 'URL updated successfully';
    } catch (error) {
      // Rollback transaction on error
      if (transaction) await transaction.rollback();
      throw error;
    }
  }

  async deleteUrlMap(shortURL: string): Promise<string> {
    let transaction: Transaction;
    try {
      // Begin transaction
      transaction = await this.sequelize.transaction();

      const urlMapEntry = await this.urlMap.findOne({ where: { shortURL }, transaction }); // Fix here
      if (!urlMapEntry) {
        throw new ShortUrlNotFoundException();
      }

      // Set isActive to false
      urlMapEntry.isActive = false;

      // Save changes
      await urlMapEntry.save({ transaction });

      // Commit transaction
      await transaction.commit();

      this.logger.log(`URL deleted: ${shortURL}`);
      return 'URL deleted successfully';
    } catch (error) {
      // Rollback transaction on error
      if (transaction) await transaction.rollback();
      throw error;
    }
  }

  async deleteAllUrlMaps(): Promise<string> {
    let transaction: Transaction;
    try {
      // Begin transaction
      transaction = await this.sequelize.transaction();

      // Delete all records from the URLMap table
      await this.urlMap.destroy({ truncate: true, transaction });

      // Commit transaction
      await transaction.commit();

      this.logger.log('All URL maps deleted successfully');
      return 'All URL maps deleted successfully';
    } catch (error) {
      // Rollback transaction on error
      if (transaction) await transaction.rollback();
      this.logger.error(`Error deleting URL maps: ${error.message}`);
      throw error;
    }
}
}
