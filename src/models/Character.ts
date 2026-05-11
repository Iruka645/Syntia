import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/db';

export class Character extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public avatarUrl!: string | null;
  public systemPrompt!: string;
  public greeting!: string;
  public createdBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Character.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatarUrl: {
      type: DataTypes.STRING,
      field: 'avatar_url',
      allowNull: true,
    },
    systemPrompt: {
      type: DataTypes.TEXT,
      field: 'system_prompt',
      allowNull: false,
    },
    greeting: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      field: 'created_by',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'characters',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
