const express = require("express");
const protect = require("../Middleware/authMiddleware");
const { getNotifications, markAsRead } = require("../Controller/Notificationcontroller");

const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/read", protect, markAsRead);

module.exports = router;
