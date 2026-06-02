const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

  name: {
    type: String,
    trim: true,
    required: [true, "Name is required"],
    minlength: [3, "Name must be atleast 3 character long"],
    maxlength: [30, "Name cannot exceed 30 characters"]
  },

  email: {
    type: String,
    required: [true, "Email required"],
    trim: true,
    lowercase: true,
    match: [
      /^\S+@\S+\.\S+$/,
      "Please enter a valid email address"
    ],
  },

  password: {
    type: String,
    required: [true, "password required"],
    minlength: [6, "Password must be 6 character"],
  },

  role: {
    type: String,
    enum: ["user", "admin", "superadmin"],
    default: "user",
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
},
  {
    timestamps: true
  });

module.exports =
  mongoose.models.Usermodel || mongoose.model("Usermodel", UserSchema);