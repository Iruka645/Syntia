import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/db';

export class Message extends Model {
  public id!: number;
  public chatId!: number;
  public role!: 'user' | 'assistant';
  public content!: string;
  public readonly createdAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    chatId: {
      type: DataTypes.INTEGER,
      field: 'chat_id',
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('user', 'assistant'),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // We only need createdAt for messages
  }
);
