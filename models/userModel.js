const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    userName: {
      type: String,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: Number,
    },   
    password: {
      type: String,
    },  
  
    otp: {
      type: String,
    },
    otpExpiry:{
      type: String,
    },
    role: {
      type: Number,
      enum: [1, 2, 3],   // 1 : user, 2:admin and 3 is moderator  
      default: 1 
    },
    gender: {
      type: String,
    },
    tokens: {
      type: String,
    },
   
    joinDate: {
      type: String,
    },
   
    status: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
