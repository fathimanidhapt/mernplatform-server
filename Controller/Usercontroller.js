

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Model/Usermodel");
const Profile = require("../Model/Profilemodel");

let register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body, "=====req.body");

    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ message: "User exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({ message: "Registered Successfully", user: newUser });
  } catch (error) {
    console.log(error, "====error");
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
}

let login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Email" });

    if (user.isBlocked) {
        return res.status(403).json({ message: "Your account has been blocked by the administration." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1y" });
    const profile = await Profile.findOne({ userId: user._id });
    let userData = {
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: profile ? (profile.profilePic || "") : ""
    };

    return res.json({ token, userData });
  } catch (error) {
    console.log(error, "====login error");
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
}

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || !query.trim()) {
      return res.json([]);
    }
    const users = await User.find({
      name: { $regex: query.trim(), $options: "i" },
      _id: { $ne: req.id }
    }).select("name role").limit(10);

    const enriched = await Promise.all(users.map(async (user) => {
      const profile = await Profile.findOne({ userId: user._id }).select("profilePic headline location");
      return {
        _id: user._id,
        name: user.name,
        role: user.role,
        profilePic: profile?.profilePic || "",
        headline: profile?.headline || "",
        location: profile?.location || ""
      };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const adminUser = await User.findById(req.id);
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const users = await User.find().select("-password");
    const enrichedUsers = await Promise.all(users.map(async (u) => {
      const profile = await Profile.findOne({ userId: u._id }).select("profilePic headline location company");
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        profilePic: profile?.profilePic || "",
        headline: profile?.headline || "",
        location: profile?.location || "",
        company: profile?.company || ""
      };
    }));

    res.json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  searchUsers,
  getAllUsers
};