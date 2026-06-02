const express = require("express");
const protect = require("../Middleware/authMiddleware");
const {
    getSuperAdminUsers,
    updateUserRole,
    deleteUserBySuperAdmin,
    getPlatformStats,
    toggleBlockUser
} = require("../Controller/SuperAdmincontroller");

const router = express.Router();

router.get("/users", protect, getSuperAdminUsers);
router.put("/users/:id/role", protect, updateUserRole);
router.delete("/users/:id", protect, deleteUserBySuperAdmin);
router.put("/users/:id/block", protect, toggleBlockUser);
router.get("/stats", protect, getPlatformStats);

module.exports = router;
