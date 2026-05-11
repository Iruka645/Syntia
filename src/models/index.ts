import { User } from './User';
import { Character } from './Character';
import { Chat } from './Chat';
import { Message } from './Message';
import sequelize from '../lib/db';

// Associations

// User -> Character (Creator)
User.hasMany(Character, { foreignKey: 'createdBy', as: 'createdCharacters' });
Character.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// User -> Chat
User.hasMany(Chat, { foreignKey: 'userId', as: 'chats' });
Chat.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Character -> Chat
Character.hasMany(Chat, { foreignKey: 'characterId', as: 'chats' });
Chat.belongsTo(Character, { foreignKey: 'characterId', as: 'character' });

// Chat -> Message
Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages' });
Message.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });

export {
  sequelize,
  User,
  Character,
  Chat,
  Message
};
