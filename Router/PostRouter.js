const express = require("express");
const protect = require("../Middleware/authMiddleware");
const upload = require("../Middleware/upload");
const {
    createPost,
    getAllPosts,
    getUserPosts,
    likePost,
    addComment,
    uploadPostImage,
    deletePost
} = require("../Controller/Postcontroller");

const router = express.Router();

router.post("/", protect, createPost);
router.get("/", protect, getAllPosts);
router.get("/user", protect, getUserPosts);
router.put("/:id/like", protect, likePost);
router.post("/:id/comment", protect, addComment);
router.post("/upload", protect, upload.single("image"), uploadPostImage);
router.delete("/:id", protect, deletePost);

module.exports = router;
