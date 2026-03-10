const { Sequelize } = require('sequelize');

// Use environment variables or defaults
const DB_NAME = process.env.DB_NAME || 'vtu_platform';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_DIALECT = process.env.DB_DIALECT || 'mysql';

// For SQLite (temporary development option)
const sequelize = DB_DIALECT === 'sqlite' 
  ? new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: false,
    })
  : new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      dialect: 'mysql',
      logging: false,
    });

module.exports = sequelize;


