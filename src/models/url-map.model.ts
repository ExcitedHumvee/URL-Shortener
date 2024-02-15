import { Model, DataTypes, Sequelize } from 'sequelize';

export class URLMap extends Model {
  public id!: number;
  public shortURL!: string;
  public longURL!: string;
  public visitorCount!: number;
  public aliasURL!: string | null;
  public isActive!: boolean;
  public requestLimit!: number;
}

export function initializeURLMapModel(sequelize: Sequelize): void {
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
      allowNull: true,
      unique: true,
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
    sequelize,
    modelName: 'URLMap',
    indexes: [{
      unique: true,
      fields: ['shortURL'],
    },
    {
      unique: true,
      fields: ['aliasURL'],
    }],
  });
}
