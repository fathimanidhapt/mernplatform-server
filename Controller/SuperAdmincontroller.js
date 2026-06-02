const User = require("../Model/Usermodel");
const Profile = require("../Model/Profilemodel");
const Post = require("../Model/Postmodel");
const Connection = require("../Model/Connectionmodel");
const Notification = require("../Model/Notificationmodel");

const checkSuperAdmin = async (userId) => {
    const user = await User.findById(userId);
    return user && user.role === "superadmin";
};

const getSuperAdminUsers = async (req, res) => {
    try {
        const isSuper = await checkSuperAdmin(req.id);
        if (!isSuper) {
            return res.status(403).json({ message: "Access denied. Super Admins only." });
        }

        const users = await User.find().select("-password");
        const enriched = await Promise.all(users.map(async (u) => {
            const profile = await Profile.findOne({ userId: u._id }).select("profilePic headline location company");
            return {
                _id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                profilePic: profile?.profilePic || "",
                headline: profile?.headline || "",
                location: profile?.location || "",
                company: profile?.company || "",
                createdAt: u.createdAt,
                isBlocked: u.isBlocked
            };
        }));

        res.json(enriched);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const isSuper = await checkSuperAdmin(req.id);
        if (!isSuper) {
            return res.status(403).json({ message: "Access denied. Super Admins only." });
        }

        const { role } = req.body;
        if (!["user", "admin", "superadmin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        const targetUser = await User.findById(req.params.id);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (targetUser._id.toString() === req.id) {
            return res.status(400).json({ message: "You cannot change your own superadmin role" });
        }

        targetUser.role = role;
        await targetUser.save();

        res.json({ message: `User role updated to ${role} successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUserBySuperAdmin = async (req, res) => {
    try {
        const isSuper = await checkSuperAdmin(req.id);
        if (!isSuper) {
            return res.status(403).json({ message: "Access denied. Super Admins only." });
        }

        const targetUser = await User.findById(req.params.id);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (targetUser._id.toString() === req.id) {
            return res.status(400).json({ message: "You cannot delete yourself" });
        }

        await User.findByIdAndDelete(req.params.id);
        await Profile.findOneAndDelete({ userId: req.params.id });
        await Post.deleteMany({ userId: req.params.id });
        await Connection.deleteMany({
            $or: [{ senderId: req.params.id }, { receiverId: req.params.id }]
        });
        await Notification.deleteMany({
            $or: [{ senderId: req.params.id }, { receiverId: req.params.id }]
        });

        res.json({ message: "User account and all related content deleted from the platform" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPlatformStats = async (req, res) => {
    try {
        const isSuper = await checkSuperAdmin(req.id);
        if (!isSuper) {
            return res.status(403).json({ message: "Access denied. Super Admins only." });
        }

        const totalUsers = await User.countDocuments({ role: "user" });
        const totalAdmins = await User.countDocuments({ role: "admin" });
        const totalSuperAdmins = await User.countDocuments({ role: "superadmin" });
        const totalPosts = await Post.countDocuments();
        const totalConnections = await Connection.countDocuments({ status: "accepted" });
        const totalPendingInvites = await Connection.countDocuments({ status: "pending" });

        res.json({
            usersCount: totalUsers,
            adminsCount: totalAdmins,
            superAdminsCount: totalSuperAdmins,
            postsCount: totalPosts,
            connectionsCount: totalConnections,
            pendingInvitesCount: totalPendingInvites
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleBlockUser = async (req, res) => {
    try {
        const isSuper = await checkSuperAdmin(req.id);
        if (!isSuper) {
            return res.status(403).json({ message: "Access denied. Super Admins only." });
        }

        const targetUser = await User.findById(req.params.id);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (targetUser._id.toString() === req.id) {
            return res.status(400).json({ message: "You cannot block yourself" });
        }

        targetUser.isBlocked = !targetUser.isBlocked;
        await targetUser.save();

        res.json({ 
            message: `User has been successfully ${targetUser.isBlocked ? 'blocked' : 'unblocked'}`,
            isBlocked: targetUser.isBlocked
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSuperAdminUsers,
    updateUserRole,
    deleteUserBySuperAdmin,
    getPlatformStats,
    toggleBlockUser
};
