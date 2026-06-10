const mongoose = require("mongoose");

const SuperAdminSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Name is required"],
    minlength: [3, "Name must be at least 3 characters long"],
    maxlength: [30, "Name cannot exceed 30 characters"]
  },
  email: {
    type: String,
    required: [true, "Email required"],
    trim: true,
    lowercase: true,
    unique: true,
    match: [
      /^\S+@\S+\.\S+$/,
      "Please enter a valid email address"
    ],
  },
  password: {
    type: String,
    required: [true, "Password required"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  role: {
    type: String,
    default: "superadmin",
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true
});

module.exports = mongoose.models.SuperAdminmodel || mongoose.model("SuperAdminmodel", SuperAdminSchema);
