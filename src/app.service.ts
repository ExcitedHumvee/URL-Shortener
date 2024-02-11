import { Injectable } from '@nestjs/common';
import { Sequelize, DataTypes } from 'sequelize';
import { URLMap } from './URLMap';

interface URLInfo {
	longURL: string;
	statistic: number;
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
            statistic: {
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
            statistic: 0,
        });
        return shortUrl;
    }

	async getOriginalUrl(shortUrl: string): Promise<string> {
        // Retrieve original URL from mapping
        const map = await this.urlMap.findOne({ where: { shortURL: shortUrl } });
        if (!map) {
            throw new Error('Short URL not found');
        }
        // Update statistics
        await map.increment('statistic');
        // You can add more detailed statistics like access location, user, etc.
        return map.longURL;
    }

    async getStats(shortUrl: string): Promise<any> {
        // Retrieve statistics for a short URL
        const map = await this.urlMap.findOne({ where: { shortURL: shortUrl } });
        if (!map) {
            throw new Error('Short URL not found');
        }
        return map.statistic;
    }

	async getAllURLs(): Promise<URLMap[]> {
        // Retrieve all records from the URLMap table
        return await this.urlMap.findAll();
    }
}