const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('vtu_platform', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // Note: 'false' should not be in quotes
});



module.exports = sequelize;





// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('cfctrxow_illmi', 'cfctrxow_illmi', 'q(OJ-9z&Eq~8', {
//     host: 'localhost',
//     dialect: 'mysql',
//     logging: false, // Note: 'false' should not be in quotes
// }); 
// module.exports = sequelize;








// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('cfctrxow_illmi', 'cfctrxow_illmi', 'q(OJ-9z&Eq~8', {
//     host: 'localhost',
//     dialect: 'mysql',
//     logging: false, // Note: 'false' should not be in quotes
// }); 
// module.exports = sequelize;


