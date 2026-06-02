const Notification = require("../Model/Notificationmodel");
const User = require("../Model/Usermodel");
const Profile = require("../Model/Profilemodel");

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ receiverId: req.id })
            .sort({ createdAt: -1 });

        const enrichedNotifications = await Promise.all(notifications.map(async (notif) => {
            const senderUser = await User.findById(notif.senderId).select("name");
            const senderProfile = await Profile.findOne({ userId: notif.senderId }).select("profilePic");
            
            return {
                _id: notif._id,
                senderId: notif.senderId,
                senderName: senderUser?.name || "Professional",
                senderProfilePic: senderProfile?.profilePic || "",
                type: notif.type,
                postId: notif.postId,
                isRead: notif.isRead,
                createdAt: notif.createdAt
            };
        }));

        res.json(enrichedNotifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { receiverId: req.id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead
};
