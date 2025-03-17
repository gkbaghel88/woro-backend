const express = require("express");

const HOME = require("../controllers/homeController");
const ADMIN = require("../controllers/adminController.js");
// const JWT_VERIFY = require("../middleware/authentication");
const jwtVerify = require("../middleware/authentication");
const JWT_VERIFY = jwtVerify.verifyToken;
const router = express.Router();

router.post("/userHome", HOME.userHome); // User Home Page
router.post("/admindashboard", JWT_VERIFY, ADMIN.adminDashboard); // Ensure function name matches

module.exports = router;
