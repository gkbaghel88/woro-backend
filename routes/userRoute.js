const express = require("express");

const router = express.Router();


const USER = require("../controllers/userController");

const jwtVerify = require("../middleware/authentication");
const authorize = require("../middleware/authorize");

const JWT_VERIFY = jwtVerify.verifyToken;

//USER CONTROLLER ROUTES START//

router.post("/userSignup", USER.userSignup); // User Signup
router.post("/signupOtpVerify", USER.signupOtpVerify); // User Signup OTP Verify
router.post("/userLogin", USER.userLogin); // User Login
router.post("/logout", JWT_VERIFY, USER.logout); // Logout
router.post("/forgotPassword", USER.forgotPassword); // Forgot Password
router.post("/verifyForgotPass", USER.verifyForgotPass); // Verify Password



router.post("/changePassword", USER.changePassword); // Change Password

// Public Route (No Authentication Required)
router.get("/public", (req, res) => {
    res.json({ Status: true, Message: "This route accessible to everyone" });
  });

 // 1 : user, 2:admin and 3 is moderator  
// Super Admin Only
router.post("/dashboard", JWT_VERIFY, authorize([2]), (req, res) => {
    res.json({ Status: true, Message: "Admin action executed" });
  });
  
  //  Moderator Only
  router.post("/moderator-dashboard", JWT_VERIFY, authorize([3]), (req, res) => {
    res.json({ Status: true, Message: "Moderator action executed" });
  });
  
  //  User & Moderator Route
  router.post("/user-moderator-dashboard", JWT_VERIFY, authorize([1, 3]), (req, res) => {
    res.json({ Status: true, Message: "User/Moderator action executed" });
  });


router.post("/sendOtp", JWT_VERIFY, USER.sendOtp);


//USER CONTROLLER ROUTES END//

module.exports = router;
