const jwt = require("jsonwebtoken");
const logs = require("../controllers/logger.js");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

// JWT Verification Middleware Start

const verifyToken = async (req, res, next) => {
  try {
    logs.newLog.log(
      "info",
      `INSIDE AUTHENTICATION ${JSON.stringify(req.body)}`
    );

    console.log("info", `INSIDE AUTHENTICATION ${JSON.stringify(req.body)}`);

    const token = req.headers.authorization;

    if (token) {
      //AUTHENTICATE JWT //

      jwt.verify(token, secretKey, async (err, authData) => {
        //Verify JWT
        if (err) {
          res.status(401).json({
            status: false,
            message: "Authentication failed",
          });

          logs.newLog.log("info", "Authentication failed");
        } else {
          // Assinging (authData) To req.user

          req.user = authData;

          // If User ID is Coming in Payload

          if (req.body.userId) {
            // If Decoded JWT Token ID and User ID Are Same

            if (req.body.userId == authData.jwtData.userId) {
              next();
              const decoded = jwt.verify(token, secretKey);
              console.log("User Role:", decoded.role); // Get Role from Token
              return;
            } else {
              res.status(401).json({
                status: false,
                message: "Access Denied Credentials Not Match",
              });

              logs.newLog.log("info", "Access Denied Credentials Not Match");

              return;
            }
          }

          next();
        }
      });
    } else {
      res.status(401).json({
        status: false,
        message: "Authentication failed. Please log in again.",
      });

      logs.newLog.log("info", "Authorization token required");
    }
  } catch (e) {
    console.log(e);
  }
};

// JWT Verification Middleware End

module.exports = { verifyToken };
