require("dotenv").config();
const nodemailer = require("nodemailer");

const USER = require("../models/userModel.js");
//const moment = require("moment-timezone");
//const { format } = require("date-fns");
//const { currDateTime } = require("./currentDateTime.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const logs = require("./logger.js");
const BASE_URL = process.env.BASE_URL;
const SECRET_KEY = process.env.SECRET_KEY;
const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;
const FROM_MAIL = process.env.FROM_MAIL;

const saltRounds = 10;

//USER SIGNUP START//

const userSignup = async (req, res) => {
  console.log('dsdsds');
  try {
    const { name, email, phone, password, confirmPassword,role } = req.body;

    if (name && email && phone && password && confirmPassword) {
      console.log("PAyLOad ", req.body);

      const findUser = await USER.findOne({ phone: phone, role: role }); //Find User

      //Check if USER Exist & Active

      if (findUser && findUser.status == 1) {
        res.status(404).json({
          status: false,
          message: "User already registerd.",
        });
      } else {
        if (password == confirmPassword) {
          var isUserId = 1;
          var isUserName = 1;

          var userId = "";
          var usrName = "";
          var chkk;

          var digits = "0123456789";
          var OTP = "";
          for (let i = 0; i < 4; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
          }

          // If User Does Not Exist Make New userId & userName

          if (!findUser) {
            // Creating Unique UserId

            while (isUserId == 1) {
              userId = generateRandomID();

              var findUserId = await USER.findOne({ userId: userId });

              if (!findUserId) {
                isUserId = 0;
              }
            }

            // Creating Unique userName

            while (isUserName == 1) {
              let firstName = name.toLowerCase().split(" ");
              usrName = firstName[0]
                .replace(/\s/g, "")
                .replace(/[^\w\s]/gi, "");
              usrName = usrName + Math.floor(1000 + Math.random() * 9000);

              chkk = await USER.findOne({ userName: usrName });

              if (chkk == null) {
                isUserName = 0;
              }
            }
          } else {
            userId = findUser.userId;
            usrName = findUser.userName;
          }

          // Securing Password By BCRYPT

          bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
              res.send(403).json({
                status: false,
                message: "Error creating password",
              });

              logs.newLog.log("info", "Error creating password");

              return;
            } else {
              // Preparing final Payload

              var allPayload = {
                userId: userId,
                userName: usrName,
                name: name,
                email: email,
                phone: phone,
                role: role, //1 Role For USER, 2: admin, 3: moderate
                password: hash,
                otp: OTP,
                status: 0,  // unverified 
              };

              // If User Does Not exist Create New Record

              if (!findUser) {
                var newData = new USER(allPayload);

                await newData.save();
              } else {
                // If User exist Update Existing Record

                await USER.updateOne(
                  { userId: findUser.userId },
                  { $set: allPayload }
                );
              }

              res.status(201).json({
                status: true,
                message: "Signup successfully",
                data: {
                  userId: userId,
                  userName: usrName,
                  name: name,
                  email: email,
                  phone: phone,
                  role: role,
                  otp: OTP,                
                  status: 0,
                },
              });

              // SENDING MAIL
              const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587, // Use 587 instead of 465
                secure: false, // Use STARTTLS instead of SSL
                auth: {
                  user: MAIL_USER,
                  pass: MAIL_PASS,
                },
                tls: {
                  rejectUnauthorized: false, // Prevent TLS issues
                },
              });

              // Your HTML email content
              const htmlContent = `
                                 ${OTP}
                            
                          
                          
                          
                              `;

              const mailOptions = {
                from: `"WORO" <${FROM_MAIL}>`,
                to: email,
                bcc: "gulshan.zealth@gmail.com",
                subject: "Your OTP for WORO",
                html: htmlContent,
              };

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.log(error);
                  console.log("Failed To send Mail");
                } else if (info) {
                  console.log("Email sent successfully");
                }
              });

              logs.newLog.log("info", "Signup successfully");
            }
          });
        } else {
          res.status(403).json({
            status: false,
            message: "Confirm password does not match",
          });

          logs.newLog.log("info", "Confirm password does not match");
        }
      }
    } else {
      res.status(401).json({
        status: false,
        message: "Please enter required fields",
      });

      logs.newLog.log("info", "Please enter required fields");
    }
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });

    logs.newLog.log("info", "ERROR");
  }
};

//USER SIGNUP END//

// SIGNUP OTP VERIFY START //

const signupOtpVerify = async (req, res) => {
  try {
    const { userId, OTP } = req.body;

    if (userId && OTP) {
      var findUser = await USER.findOne({ userId: userId, status: 0 }); // Find User

      // Check if user Exist or Not

      if (findUser) {
        if (OTP == findUser.otp) {
          var jwtData = {
            userId: findUser.userId,
            userName: findUser.userName,
            name: findUser.name,
            phone: findUser.phone,
            role: findUser.role,
          };

          // Generating JWT Token

          jwt.sign({ jwtData }, SECRET_KEY, async (err, token) => {
            if (err) {
              res.status(403).json({
                status: false,
                message: "Unable to generate token",
              });

              logs.newLog.log("info", "Unable to generate token");

              return;
            } else {
              // Join Date Of Today

              // Current Local Date and Time

              const nowDate = new Date();

             

              jwtData = {
                tokens: token,
                status: 1,
              
              };

              // User Data Update

              await USER.updateOne(
                { userId: findUser.userId },
                { $set: jwtData }
              ).exec();
            }
          });

          res.status(200).json({
            status: true,
            message: "OTP verified successfully",
          });

          logs.newLog.log("info", "OTP verified successfully");
        } else {
          res.status(401).json({
            status: false,
            message: "Invalid OTP",
          });

          logs.newLog.log("info", "Invalid OTP");
        }
      } else {
        res.status(403).json({
          status: false,
          message: "User not found",
        });

        logs.newLog.log("info", "User not found");
      }
    } else {
      res.status(401).json({
        status: false,
        message: "Please enter required fields",
      });

      logs.newLog.log("info", "Please enter required fields");
    }
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });

    logs.newLog.log("info", "ERROR");
  }
};

// SIGNUP OTP VERIFY END //

//USER LOGIN START//

const userLogin = async (req, res) => {
  console.log('login now');  
  try {
    const { phone, password } = req.body;
    console.log('login now--1111');  
    if (!phone || !password) {
      logs.newLog.log("info", "Please enter required fields");
      return res.status(401).json({ status: false, message: "Please enter required fields" });
    }
    console.log('login now-22');  
    // Find user in DB
    const findUser = await USER.findOne({ phone, status: 1 });
    if (!findUser) {
      logs.newLog.log("info", "User not registered");
      return res.status(404).json({ status: false, message: "User not registered" });
    }
    console.log('login now-3333');  
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, findUser.password);
    if (!passwordMatch) {
      logs.newLog.log("info", "Invalid credentials");
      return res.status(401).json({ status: false, message: "Invalid credentials" });
    }
    console.log('login now--44');  

    // Generate JWT token
    const jwtData = {
      userId: findUser.userId,
      userName: findUser.userName,
      name: findUser.name,
      phone: findUser.phone,
      role: findUser.role,
    };

    const token = jwt.sign(jwtData, SECRET_KEY, { expiresIn: "15m" });

    // Update token in database
    await USER.updateOne({ userId: findUser.userId }, { $set: { tokens: token } });

    // Return response with token
    logs.newLog.log("info", "Login successful");
    return res.status(200).json({
      status: true,
      message: "Login successful",
      data: {
        userId: findUser.userId,
        userName: findUser.userName,
        name: findUser.name,
        email: findUser.email,
        phone: findUser.phone,
        role: findUser.role,
        token, // ✅ Correctly sending the updated token
      },
    });

  } catch (error) {
    logs.newLog.log("info", "ERROR: " + error.message);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

module.exports = { userLogin };


//USER LOGIN END//


// Logout User Start//

const logout = async (req, res) => {
  try {
    const { userId } = req.body;

    if (userId) {

      upd = {
        tokens: "xxxx",
      
      };

      await USER.updateOne({ userId: userId }, { $set: upd });

      res.status(200).json({
        status: true,
        message: "Logout successfull",
      });

      logs.newLog.log("info", "Logout successfull");
    } else {
      res.status(401).json({
        status: false,
        message: "Please enter required fields",
      });

      logs.newLog.log("info", "Please enter required fields");
    }
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });

    logs.newLog.log("info", "ERROR");
  }
};

// Logout User End//


// Forgot Password Send OTP Start //

const forgotPassword = async (req, res) => {
  try {
    // Getting Payload

    const { phone } = req.body;

    // Check Required Fields

    if (phone) {
      // Find User Detail

      const findUser = await USER.findOne({ phone: phone, role: 1, status: 1 });

      if (findUser) {
        var digits = "0123456789";
        var OTP = "";
        for (let i = 0; i < 4; i++) {
          OTP += digits[Math.floor(Math.random() * 10)];
        }

        // Updating OTP

        await USER.updateOne(
          { userId: findUser.userId },
          { $set: { otp: OTP } }
        );

        // SENDING MAIL
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587, // Use 587 instead of 465
          secure: false, // Use STARTTLS instead of SSL
          auth: {
            user: MAIL_USER,
            pass: MAIL_PASS,
          },
          tls: {
            rejectUnauthorized: false, // Prevent TLS issues
          },
        });

        // Your HTML email content
        const htmlContent = `
                 <p> Hello ${findUser.name},</p>
                                     <p style="font-size: 16px; line-height: 1.5;">
                                         Use the OTP  ${OTP}
                                     </p>
                                
                                      `;

        const mailOptions = {
          from: `"woro" <${FROM_MAIL}>`,
          to: findUser.email,
          bcc: "gulshan.zealth@gmail.com",
          subject: "Login/Signup OTP",
          html: htmlContent,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
            console.log("Failed To send Mail");
          } else if (info) {
            console.log("Email sent successfully");
          }
        });

        res.status(200).json({
          status: true,
          message: "OTP Sent",
          data: {
            userId: findUser.userId,
            OTP: OTP,
          },
        });

        logs.newLog.log("info", "OTP Sent");
      } else {
        res.status(401).json({
          status: false,
          message: "User not registered",
        });

        logs.newLog.log("info", "User not registered");
      }
    } else {
      res.status(401).json({
        status: false,
        message: "Please enter required fields",
      });

      logs.newLog.log("info", "Please enter required fields");
    }
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });

    logs.newLog.log("info", "ERROR");
  }
};

// Forgot Password Send OTP End //

// Forgot Password Verify Start //

const verifyForgotPass = async (req, res) => {
  try {
    // Getting Payload

    const { userId, OTP } = req.body;

    // Check Required Fields

    if (userId && OTP) {
      // Find USER Detail

      var findUser = await USER.findOne({ userId: userId, status: 1 });

      if (findUser) {
        // Check If OTP is Matched

        if (findUser.otp == OTP) {
          res.status(200).json({
            status: true,
            message: "OTP Match",
            data: {
              userId: userId,
            },
          });

          logs.newLog.log("info", "OTP Match");
        } else {
          res.status(401).json({
            status: false,
            message: "Invalid OTP",
          });

          logs.newLog.log("info", "Invalid OTP");
        }
      } else {
        res.status(401).json({
          status: false,
          message: "User not found",
        });

        logs.newLog.log("info", "User not found");
      }
    } else {
      res.status(401).json({
        status: false,
        message: "Please enter required fields",
      });

      logs.newLog.log("info", "Please enter required fields");
    }
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });

    logs.newLog.log("info", "ERROR");
  }
};

// Forgot Password Verify End //

// Change Password Start //

const changePassword = async (req, res) => {
  try {
    // Getting Payload

    const { userId, password, confirmPassword,OTP } = req.body;

    // Check Required Fields

    if (userId && password && confirmPassword && OTP) {
      // Check Both Password Match

      var findUser = await USER.findOne({ userId: userId, status: 1 });

      if (findUser) {
        // Check If OTP is Matched

        if (findUser.otp == OTP) {

          if (password == confirmPassword) {
            // Creating Encrypted Password
    
            bcrypt.hash(password, saltRounds, async (err, hash) => {
              if (err) {
                res.send(403).json({
                  status: false,
                  message: "Error creating password",
                });
    
                logs.newLog.log("info", "Error creating password");
    
                return;
              } else {
                // Update USER Password
    
                console.log("hash ", hash);
    
                await USER.updateOne(
                  { userId: userId },
                  { $set: { password: hash } }
                );
    
                res.status(201).json({
                  status: true,
                  message: "Pasword updated successfully",
                });
    
                logs.newLog.log("info", "Pasword updated successfully");
              }
            });
          } else {
            res.status(403).json({
              status: false,
              message: "Confirm password does not match",
            });
    
            logs.newLog.log("info", "Confirm password does not match");
          }
         
        } else {
          res.status(401).json({
            status: false,
            message: "Invalid OTP",
          });

          logs.newLog.log("info", "Invalid OTP");
        }
      } else {
        res.status(401).json({
          status: false,
          message: "User not found",
        });

        logs.newLog.log("info", "User not found");
      }

    
    } else {
      res.status(401).json({
        status: false,
        message: "Please enter required fields",
      });

      logs.newLog.log("info", "Please enter required fields");
    }
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });

    logs.newLog.log("info", "ERROR");
  }
};

// Change Password End //



// Function to generate random alphanumeric string
function generateRandomID() {
  const prefix = "USR"; // Static prefix
  const length = 6; // Length of random part
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Allowed characters
  let randomPart = "";

  // Generate random string of 6 characters
  for (let i = 0; i < length; i++) {
    randomPart += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  // Combine prefix and random part
  return prefix + randomPart;
}


// Generate random 4-digit OTP
const generateToken = () => Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP

const sendOtp = async (req, res) => {
  try {
    const reqUser = req.user?.jwtData;

    // Check if user is authenticated and has valid role
    if (!reqUser) {
      logs.newLog.log("error", "User authentication data missing");
      return res.status(401).json({
        status: false,
        message: "Authentication required",
      });
    }
    // reqUser.role == 1 for user,  reqUser.role == 2 for admin and  reqUser.role == 3 for moderate
    if (
      reqUser.role !== 1 &&
      reqUser.role !== 2 &&
      reqUser.role !== 3 &&
      reqUser.role !== 5
    ) {
      return res.status(403).json({
        status: false,
        message: "Unauthorized to access",
      });
    }

    const { userId, email } = req.body;

    // Validate required fields
    if (!userId || !email) {
      logs.newLog.log("error", "Missing required fields");
      return res.status(400).json({
        status: false,
        message: "Please enter all required fields",
      });
    }

    // Step 1: Check if user exists
    // Step 2: Generate OTP and expiry time
    const otp = generateToken(); // Ensure this returns a valid string or number
    if (!otp) {
      throw new Error("Failed to generate OTP");
    }

    const otpExpiryDate = Date.now() + 10 * 60 * 1000;
    // let user = await USER.findOne({ email });
    const user = await USER.findOneAndUpdate(
      { email },
      {
        $set: {
          otp,
          otpExpiry: otpExpiryDate, // OTP valid for 10 minutes
        },
      },
      { new: true } // Returns the updated document
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Step 3: Send email with 'Verify OTP' button
    const encodedEmail = Buffer.from(email).toString("base64");
    const encodedOtp = Buffer.from(otp).toString("base64");

    const link = `${BASE_URL}user/verifyEmail?email=${encodedEmail}&otp=${encodedOtp}`;

    console.log("Updated user:", encodedEmail, encodedOtp);
    // SMTP configuration
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587, // Using STARTTLS
      secure: false,
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify SMTP connection
    await transporter.verify((error) => {
      if (error) {
        throw new Error("SMTP connection failed: " + error.message);
      }
    });

    // Email content
    const html = `
  <div style="
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f9f9f9;
    padding: 30px;
    border-radius: 8px;
    text-align: center;
    max-width: 500px;
    margin: 20px auto;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  "><div style="background-color:#640d5f;padding:20px 0px;">
                            <p style="margin:0;display:block;text-align:center;width:100%;">
                              <img src="${LOGO}" style="max-width:150px;">
                            </p>
                          </div>
    <h2 style="
      color: #ff5722;
      font-weight: bold;
      margin-bottom: 20px;
    ">Verify Your Email</h2>
    
    <p style="
      font-size: 16px;
      margin-bottom: 20px;
    ">
      Hello, ${user.name} <br />
      <p>Please click the button below to verify your email:</p>
    </p>
  
    <a href="${link}" target="_blank" style="
      display: inline-block;
      padding: 14px 28px;
      background-color: #eb3d00;
      color: #ffffff;
      font-size: 16px;
      font-weight: bold;
      text-decoration: none;
      border-radius: 20px;
      transition: background-color 0.3s ease;
      margin-top: 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    ">Verify Email</a>
    
    <p style="
      font-size: 14px;
      margin-top: 20px;
      color: #777;
    ">
      This link will expire in <strong>10 minutes</strong>.
    </p>
    
    <p style="
      font-size: 12px;
      color: #999;
      margin-top: 20px;
      border-top: 1px solid #eee;
      padding-top: 10px;
    ">
      If you did not request this, please ignore this email.
    </p>
  </div>
`;

    const mailOptions = {
      from: `"Hostellers.in" <${FROM_MAIL}>`,
      to: user.email,
      bcc: "gulshan.zealth@gmail.com",
      subject: `HOSTELLERS - Verify Email!`,
      html,
    };

    // console.log("Mail options prepared:", mailOptions);

    // Send email
    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully to:", user.email, "otp:", otp);

    return res.status(200).json({
      message: "4-digit verification email sent successfully",
      otp,
      email,
    });
  } catch (error) {
    console.error("Error in sendOtp:", error);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
};

const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await USER.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerify) {
      return res.status(400).json({ error: "Email already verified" });
    }

    //  Throttle resend attempts (e.g., max 3 times in 30 minutes)
    const lastSentTime = user.otpExpiry ? user.otpExpiry - 10 * 60 * 1000 : 0;
    const currentTime = Date.now();

    if (currentTime - lastSentTime < 5 * 60 * 1000) {
      return res.status(429).json({
        error: "Please wait before resending verification email",
      });
    }

    //  Generate new token and send the email
    await sendOtp({ body: { email } }, res);
  } catch (error) {
    console.error("Error resending verification email:", error);
  }
};

//verify user
const verifyUser = async (req, res) => {
  const { otp, email } = req.query;

  try {
    const decodedEmail = Buffer.from(email, "base64").toString("utf8");
    const decodedOtp = Buffer.from(otp, "base64").toString("utf8");
    console.log("Decrypted Email:", decodedEmail);
    console.log("Decrypted OTP:", decodedOtp);
   
    // Query the database with decrypted values
    const user = await USER.findOne({
      email: decodedEmail,
      otp: decodedOtp,
      
    });
    if (!user) {
      return res.status(400).json({ error: "OTP verification failed" });
    }

    console.log("USER:", user);

    // Step 5: Mark user as verified
    user.isVerify = true;   
    user.otpExpiry = undefined;
    await user.save();

    console.log("SUCCESSFUL");

    // Step 6: Redirect to frontend after successful verification
    return res.redirect(`https://hostellers.in/profile`);
    // return res.status(200).json({ message: "User Verified Successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res
      .status(500)
      .json({ error: "Failed to verify OTP", details: error.message });
  }
};

module.exports = {
  

  userSignup,
  signupOtpVerify,
  userLogin,
  logout,

  forgotPassword,
  verifyForgotPass,
  changePassword,
  sendOtp,
  verifyUser,
  resendVerificationEmail,
};
