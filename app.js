const express = require("express");
const mongoose = require('mongoose');
const helmet = require("helmet");
const app = express();
const connectDB = require("./config/db.js");
const xssClean = require("xss-clean");
const cors = require("cors");
const Route = require("./routes/index.js"); // Centralized routing
require("dotenv").config();



const URI = process.env.URI;
const PORT = process.env.PORT || 4000;



app.use(helmet());
app.use(xssClean());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", true);
app.use((req, res, next) => {
  if (req.url.endsWith(".js")) {
    res.setHeader("Content-Type", "application/javascript");
  } else if (req.url.endsWith(".css")) {
    res.setHeader("Content-Type", "text/css");
  } else if (req.url.endsWith(".html")) {
    res.setHeader("Content-Type", "text/html");
  }
  next();
});

app.use("/", Route); // Use the central route handler

const Start = async () => {
  try {
    await connectDB(URI);
   

    app.listen(PORT, () => {
      console.log(`SERVER RUNNING AT PORT ${PORT}`);
    });
  } catch (error) {
    console.error("Error during server startup:", error.message);
  }
};

Start();

module.exports = app; // Export app if needed in other files
