import { sequelize } from './src/models';

async function initDB() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Sync all models with the database (force: true drops tables if they exist)
    await sequelize.sync({ force: true });
    console.log('All models were synchronized successfully.');
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

initDB();
