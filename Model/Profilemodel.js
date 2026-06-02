const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usermodel",
    required: true,
    unique: true
  },
  phone: {
    type: String,
    default: "",
  },
  profilePic: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  headline: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  education: {
    type: String,
    default: "",
  },
  company: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other", ""],
    default: "",
  },
  dob: {
    type: Date,
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Profilemodel || mongoose.model("Profilemodel", ProfileSchema);
