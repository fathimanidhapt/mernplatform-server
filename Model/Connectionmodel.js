const mongoose = require("mongoose");

const ConnectionSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usermodel",
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usermodel",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Connectionmodel || mongoose.model("Connectionmodel", ConnectionSchema);
