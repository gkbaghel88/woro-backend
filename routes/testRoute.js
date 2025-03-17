const express = require("express");

const router = express.Router();

const TEST = require("../controllers/testController");

router.get("/", TEST.testController); // Default Home Route


module.exports = router;
