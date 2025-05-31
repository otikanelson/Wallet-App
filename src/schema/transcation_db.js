const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Transactions = sequelize.define(
  "transactions",
  {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
    
      amount: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING, 
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      network: {
        type: DataTypes.ENUM('MTN', 'AIRTEL', 'GLO', '9MOBILE'),
        allowNull: true,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reference: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
    },
  {
    paranoid: true,
    timestamps: true,
  }
);



module.exports = Transactions;
