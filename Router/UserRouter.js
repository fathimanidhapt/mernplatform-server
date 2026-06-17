const express = require("express");
const protect = require("../Middleware/authMiddleware");
const {
  register,
  login,
  searchUsers,
  getAllUsers
} = require("../Controller/Usercontroller");

const upload = require("../Middleware/upload");

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