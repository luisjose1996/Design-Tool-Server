const express = require("express");
const db = require("./database/connectDB.js");
const dotenv = require("dotenv");
const router = require("./routes.js");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
const port = 2880;

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


//routes
app.use("/", router);

module.exports = db;
