const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usermodel",
    required: true
  },
  content: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: ""
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usermodel"
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usermodel",
      required: true
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.models.Postmodel || mongoose.model("Postmodel", PostSchema);
