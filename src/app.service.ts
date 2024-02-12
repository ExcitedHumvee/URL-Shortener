import { Injectable } from '@nestjs/common';
import { Sequelize, DataTypes, Model } from 'sequelize';

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
    });

    // Synchronize the model with the database
    this.sequelize.sync();

    this.urlMap = URLMap;
  }

  getHello(): string {
    return 'Hello World!';
  }

  async shortenUrl(input: string): Promise<string> {
    // Generate short URL and store mapping
    const shortUrl = [...Array(5)].map(() => Math.random().toString(36)[2]).join('');
    await this.urlMap.create({
      shortURL: shortUrl,
      longURL: input,
      visitorCount: 0,
    });
    return shortUrl;
  }

  async getOriginalUrl(shortUrl: string,ipAddress: string): Promise<string> {
    // Retrieve original URL from mapping
    const map = await this.urlMap.findOne({ where: { shortURL: shortUrl } });
    if (!map) {
      throw new Error('Short URL not found');
    }
    // Update statistics
    await map.increment('visitorCount');
    // You can add more detailed statistics like access location, user, etc.
    return map.longURL;
  }

  async getStats(shortUrl: string): Promise<any> {
    // Retrieve statistics for a short URL
    const map = await this.urlMap.findOne({ where: { shortURL: shortUrl } });
    if (!map) {
      throw new Error('Short URL not found');
    }
    return map.visitorCount;
  }

  async getAllURLs(): Promise<URLMap[]> {
    // Retrieve all records from the URLMap table
    return await this.urlMap.findAll();
  }
}
