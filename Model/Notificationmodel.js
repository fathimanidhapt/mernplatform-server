const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usermodel",
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usermodel",
    required: true
  },
  type: {
    type: String,
    enum: ["like", "comment", "connection_request", "connection_accept"],
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Postmodel",
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Notificationmodel || mongoose.model("Notificationmodel", NotificationSchema);
