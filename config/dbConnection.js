// // dbConnection.js
// const mysql = require('mysql2/promise');  // Use promise version
// const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

// const db = mysql.createPool({
//     host: DB_HOST,
//     user: DB_USERNAME,
//     password: DB_PASSWORD,
//     database: DB_NAME,
// });

// module.exports = db;

const mysql = require('mysql2/promise');
const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

const db = mysql.createPool({
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
});

module.exports = db;
