import { Model } from 'sequelize';

export class URLMap extends Model {
	public id!: number;
	public shortURL!: string;
	public longURL!: string;
	public statistic!: number;
}
