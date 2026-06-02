const Connection = require("../Model/Connectionmodel");
const User = require("../Model/Usermodel");
const Profile = require("../Model/Profilemodel");
const Notification = require("../Model/Notificationmodel");

const sendConnectionRequest = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        if (targetUserId === req.id) {
            return res.status(400).json({ message: "You cannot connect with yourself" });
        }

        const existing = await Connection.findOne({
            $or: [
                { senderId: req.id, receiverId: targetUserId },
                { senderId: targetUserId, receiverId: req.id }
            ]
        });

        if (existing) {
            return res.status(400).json({ message: "Connection request already exists or you are already connected" });
        }

        const newRequest = await Connection.create({
            senderId: req.id,
            receiverId: targetUserId,
            status: "pending"
        });

        await Notification.create({
            receiverId: targetUserId,
            senderId: req.id,
            type: "connection_request"
        });

        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const respondToConnectionRequest = async (req, res) => {
    try {
        const { action } = req.body; // "accepted" or "rejected"
        if (!["accepted", "rejected"].includes(action)) {
            return res.status(400).json({ message: "Invalid action" });
        }

        const connection = await Connection.findOne({
            senderId: req.params.id,
            receiverId: req.id,
            status: "pending"
        });

        if (!connection) {
            return res.status(404).json({ message: "Pending connection request not found" });
        }

        if (action === "accepted") {
            connection.status = "accepted";
            await connection.save();

            await Notification.create({
                receiverId: connection.senderId,
                senderId: req.id,
                type: "connection_accept"
            });

            res.json({ message: "Connection request accepted", connection });
        } else {
            await Connection.findByIdAndDelete(connection._id);
            res.json({ message: "Connection request rejected" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getConnections = async (req, res) => {
    try {
        const connections = await Connection.find({
            $or: [{ senderId: req.id }, { receiverId: req.id }],
            status: "accepted"
        });

        const enrichedConnections = await Promise.all(connections.map(async (conn) => {
            const friendId = conn.senderId.toString() === req.id ? conn.receiverId : conn.senderId;
            const friendUser = await User.findById(friendId).select("name role");
            const friendProfile = await Profile.findOne({ userId: friendId }).select("profilePic headline location");
            
            return {
                _id: conn._id,
                friendId: friendId,
                name: friendUser?.name || "Professional",
                role: friendUser?.role || "user",
                profilePic: friendProfile?.profilePic || "",
                headline: friendProfile?.headline || "Professional",
                location: friendProfile?.location || "Location not specified"
            };
        }));

        res.json(enrichedConnections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPendingRequests = async (req, res) => {
    try {
        const pending = await Connection.find({
            receiverId: req.id,
            status: "pending"
        });

        const enrichedRequests = await Promise.all(pending.map(async (reqst) => {
            const senderUser = await User.findById(reqst.senderId).select("name role");
            const senderProfile = await Profile.findOne({ userId: reqst.senderId }).select("profilePic headline location");

            return {
                _id: reqst._id,
                senderId: reqst.senderId,
                name: senderUser?.name || "Professional",
                role: senderUser?.role || "user",
                profilePic: senderProfile?.profilePic || "",
                headline: senderProfile?.headline || "Professional",
                location: senderProfile?.location || "Location not specified"
            };
        }));

        res.json(enrichedRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getConnectableUsers = async (req, res) => {
    try {
        const existing = await Connection.find({
            $or: [{ senderId: req.id }, { receiverId: req.id }]
        });

        const excludedUserIds = [req.id];
        existing.forEach(conn => {
            excludedUserIds.push(conn.senderId.toString());
            excludedUserIds.push(conn.receiverId.toString());
        });

        const suggestions = await User.find({
            _id: { $nin: excludedUserIds },
            role: "user"
        }).select("name role");

        const enrichedSuggestions = await Promise.all(suggestions.map(async (suggestUser) => {
            const suggestProfile = await Profile.findOne({ userId: suggestUser._id }).select("profilePic headline location");
            return {
                _id: suggestUser._id,
                name: suggestUser.name,
                role: suggestUser.role,
                profilePic: suggestProfile?.profilePic || "",
                headline: suggestProfile?.headline || "Professional",
                location: suggestProfile?.location || "Location not specified"
            };
        }));

        res.json(enrichedSuggestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSentRequests = async (req, res) => {
    try {
        const sent = await Connection.find({
            senderId: req.id,
            status: "pending"
        });

        const enrichedRequests = await Promise.all(sent.map(async (reqst) => {
            const receiverUser = await User.findById(reqst.receiverId).select("name role");
            const receiverProfile = await Profile.findOne({ userId: reqst.receiverId }).select("profilePic headline location");

            return {
                _id: reqst._id,
                receiverId: reqst.receiverId,
                name: receiverUser?.name || "Professional",
                role: receiverUser?.role || "user",
                profilePic: receiverProfile?.profilePic || "",
                headline: receiverProfile?.headline || "Professional",
                location: receiverProfile?.location || "Location not specified"
            };
        }));

        res.json(enrichedRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const cancelConnectionRequest = async (req, res) => {
    try {
        const connection = await Connection.findOne({
            _id: req.params.id,
            senderId: req.id,
            status: "pending"
        });

        if (!connection) {
            return res.status(404).json({ message: "Connection request not found or not sent by you" });
        }

        await Connection.findByIdAndDelete(connection._id);
        res.json({ message: "Connection request cancelled successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendConnectionRequest,
    respondToConnectionRequest,
    getConnections,
    getPendingRequests,
    getConnectableUsers,
    getSentRequests,
    cancelConnectionRequest
};
