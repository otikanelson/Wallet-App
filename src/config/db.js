const { Sequelize } = require('sequelize');
// Explicitly require mysql2 so bundlers (e.g. Vercel) include it in the function bundle
require('mysql2');

const DB_NAME     = process.env.DB_NAME     || 'vtu_platform';
const DB_USER     = process.env.DB_USER     || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST     = process.env.DB_HOST     || 'localhost';
const DB_PORT     = parseInt(process.env.DB_PORT, 10) || 3306;
const DB_DIALECT  = process.env.DB_DIALECT  || 'mysql';

const sequelize = DB_DIALECT === 'sqlite'
  ? new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: false,
    })
  : new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      port: DB_PORT,
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        // Required for Aiven — enforces SSL on the connection
        ssl: {
          rejectUnauthorized: true,
        },
      },
    });

module.exports = sequelize;
