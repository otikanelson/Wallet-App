const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const argon2 = require("argon2");

const DEFAULT_PROFILE_PIC =
  "https://res.cloudinary.com/ducx7nije/image/upload/v1726317886/145857007_307ce493-b254-4b2d-8ba4-d12c080d6651_kqpuao.jpg";

const User = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // Personal Details
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
      unique: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isNumeric: true,
      },
    },
    gender: {
      type: DataTypes.ENUM("male", "female"),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    aboutUs: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Location
    latitude: {
      type: DataTypes.FLOAT(10, 6),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT(10, 6),
      allowNull: true,
    },

    // Auth & Role
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transactionPin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    appleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM("admin", "user", "basic-admin", "standard-admin"),
      allowNull: false,
      defaultValue: "user",
    },
    status: {
      type: DataTypes.ENUM("verified", "unverified", "active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },

    // Misc
    profilePicture: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: DEFAULT_PROFILE_PIC,
    },
    pushToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    totalFund: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "0",
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
    ],
    paranoid: true,
    timestamps: true,
  }
);

// Lifecycle hooks
User.beforeCreate(async (user) => {
  if (user.password) {
     const hashedPassword = await argon2.hash(user.password);
        user.password = hashedPassword;
        }
  if (user.transactionPin) {
    user.transactionPin = await argon2.hash(user.transactionPin);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    user.password = await argon2.hash(user.password);
  }
  if (user.changed("transactionPin")) {
    user.transactionPin = await argon2.hash(user.transactionPin);
  }
});

module.exports = User;
