const express = require("express");
const testRoutes = require("./testRoute");
const userRoutes = require("./userRoute");
const productRoutes = require("./productRoute");
const router = express.Router();

// Routing definitions

router.use("/", testRoutes); // Handle / routes
router.use("/user", userRoutes); // Handle /user routes
router.use("/product", productRoutes); // Handle /Product routes
module.exports = router;
