const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config();
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "pw4mysql.0805",//process.env.PASSWORD,
  database: "users",
});

module.exports = db;
