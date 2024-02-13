import { Injectable } from '@nestjs/common';
import { Sequelize, DataTypes, Model } from 'sequelize';
import { UpdateUrlDto } from './app.dto';

export class URLMap extends Model {
	public id!: number;
	public shortURL!: string;
	public longURL!: string;
	public visitorCount!: number; // Renamed from statistic
	public aliasURL!: string | null; // New field
	public isActive!: boolean; // New field
	public requestLimit!: number; // New field
}

@Injectable()
export class AppService {
  private sequelize: Sequelize;
  private urlMap: typeof URLMap;

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
      visitorCount: { // Renamed from statistic
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      aliasURL: { // New field
        type: DataTypes.STRING,
        allowNull: true, // Nullable
        unique: true, // Unique constraint
      },
      isActive: { // New field
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      requestLimit: { // New field
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

  async shortenUrl(input: string, aliasURL?: string, requestLimit: number = 0): Promise<string> { // Default requestLimit to 0
    // Generate short URL and store mapping with requestLimit
    const shortUrl = [...Array(5)].map(() => Math.random().toString(36)[2]).join('');
    await this.urlMap.create({
      shortURL: shortUrl,
      longURL: input,
      visitorCount: 0,
      aliasURL: aliasURL || null,
      requestLimit: requestLimit, // Include requestLimit
    });
    return shortUrl;
  }

  async getOriginalUrl(shortUrl: string, ipAddress: string): Promise<string> {
    // First, try to find the shortURL in the URLMap model
    let map = await this.urlMap.findOne({ where: { shortURL: shortUrl } });

    // If not found, try to find it in the aliasURLs
    if (!map) {
      map = await this.urlMap.findOne({ where: { aliasURL: shortUrl } });
    }

    if (!map) {
      throw new Error('Short URL or alias not found');
    }

    // Check if requestLimit is set and if the visitorCount has reached the limit
    if (map.requestLimit && map.visitorCount >= map.requestLimit) {
      throw new Error('Request limit reached for this URL');
    }

    // Check if the URL is active
    if (!map.isActive) {
      throw new Error('This link has been deleted');
    }

    // Update statistics
    await map.increment('visitorCount');
    // You can add more detailed statistics like access location, user, etc.
    return map.longURL;
  }

  async getVisitorCount(shortUrl: string): Promise<any> {
    // Retrieve statistics for a short URL
    let map = await this.urlMap.findOne({ where: { shortURL: shortUrl } });
    // If not found, try to find it in the aliasURLs
    if (!map) {
      map = await this.urlMap.findOne({ where: { aliasURL: shortUrl } });
    }
    if (!map) {
      throw new Error('Short URL or alias not found');
    }
    return map;
  }

  async getAllURLs(): Promise<URLMap[]> {
    // Retrieve all records from the URLMap table
    return await this.urlMap.findAll();
  }

  async updateUrlMap(updateUrlDto: UpdateUrlDto): Promise<string> {
    const { shortURL, requestLimit, alias } = updateUrlDto;

    // Find the URLMap entry
    const urlMapEntry = await this.urlMap.findOne({ where: { shortURL } });

    if (!urlMapEntry) {
      throw new Error('URL not found');
    }

    // Update the URLMap entry
    if (requestLimit !== undefined) {
      urlMapEntry.requestLimit = requestLimit;
    }

    if (alias !== undefined) {
      urlMapEntry.aliasURL = alias;
    }

    // Save changes
    await urlMapEntry.save();

    return 'URL updated successfully';
  }

  async deleteUrlMap(shortURL: string): Promise<string> {
    const urlMapEntry = await this.urlMap.findOne({ where: { shortURL } });

    if (!urlMapEntry) {
      throw new Error('URL not found');
    }

    // Set isActive to false
    urlMapEntry.isActive = false;
    await urlMapEntry.save();

    return 'URL deleted successfully';
  }
}
