const User = require("../Model/Usermodel");
const Profile = require("../Model/Profilemodel");

const getProfile = async (req, res) => {
    console.log("getProfile called. req.query:", req.query, "req.id:", req.id);
    try {
        const targetUserId = req.query.userId || req.id;
        console.log("Resolved targetUserId:", targetUserId);
        const user = await User.findById(targetUserId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let profile = await Profile.findOne({ userId: targetUserId });
        if (!profile) {
            profile = await Profile.create({ userId: targetUserId });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            phone: profile.phone,
            profilePic: profile.profilePic,
            bio: profile.bio,
            headline: profile.headline,
            location: profile.location,
            education: profile.education,
            company: profile.company,
            gender: profile.gender,
            dob: profile.dob
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        if (req.body.name) {
            await User.findByIdAndUpdate(req.id, { name: req.body.name });
        }

        const profile = await Profile.findOneAndUpdate(
            { userId: req.id },
            {
                phone: req.body.phone,
                profilePic: req.body.profilePic,
                bio: req.body.bio,
                headline: req.body.headline,
                location: req.body.location,
                education: req.body.education,
                company: req.body.company,
                gender: req.body.gender,
                dob: req.body.dob
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        const updatedUser = await User.findById(req.id).select("-password");

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            createdAt: updatedUser.createdAt,
            phone: profile.phone,
            profilePic: profile.profilePic,
            bio: profile.bio,
            headline: profile.headline,
            location: profile.location,
            education: profile.education,
            company: profile.company,
            gender: profile.gender,
            dob: profile.dob
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const fileUrl = `${req.protocol}://${req.get("host")}/upload/${req.file.filename}`;

        await Profile.findOneAndUpdate(
            { userId: req.id },
            { profilePic: fileUrl },
            { new: true, upsert: true }
        );

        res.json({ profilePic: fileUrl });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    uploadProfilePic,
};