const express = require("express");
const protect = require("../Middleware/authMiddleware");
const {
  register,
  login,
  searchUsers,
  getAllUsers
} = require("../Controller/Usercontroller");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const {
  getProfile,
  updateProfile,
  uploadProfilePic,
} = require("../Controller/Profilecontroller");
const router = express.Router();

router.post("/register", register);

router.post("/login", login);
router.get("/all", protect, getAllUsers);
router.get("/search", protect, searchUsers);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/upload", protect, upload.single("profilePic"), uploadProfilePic);

module.exports = router;