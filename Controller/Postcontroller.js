const Post = require("../Model/Postmodel");
const User = require("../Model/Usermodel");
const Profile = require("../Model/Profilemodel");
const Notification = require("../Model/Notificationmodel");

const createPost = async (req, res) => {
    try {
        const { content } = req.body;
        let imageUrl = req.body.image || "";

        if (req.file) {
            imageUrl = `http://localhost:3000/upload/${req.file.filename}`;
        }

        const newPost = await Post.create({
            userId: req.id,
            content,
            image: imageUrl
        });

        const author = await User.findById(req.id).select("name role");
        const profile = await Profile.findOne({ userId: req.id }).select("profilePic headline");

        res.status(201).json({
            _id: newPost._id,
            content: newPost.content,
            image: newPost.image,
            likes: newPost.likes,
            createdAt: newPost.createdAt,
            author: {
                _id: author?._id,
                name: author?.name || "Professional",
                role: author?.role || "user",
                profilePic: profile?.profilePic || "",
                headline: profile?.headline || ""
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });

        const enrichedPosts = await Promise.all(posts.map(async (post) => {
            const author = await User.findById(post.userId).select("name role isBlocked");
            const profile = await Profile.findOne({ userId: post.userId }).select("profilePic headline");

            const enrichedComments = await Promise.all((post.comments || []).map(async (comment) => {
                const commenter = await User.findById(comment.userId).select("name");
                const commenterProfile = await Profile.findOne({ userId: comment.userId }).select("profilePic headline");
                return {
                    _id: comment._id,
                    text: comment.text,
                    createdAt: comment.createdAt,
                    userId: comment.userId,
                    author: {
                        name: commenter?.name || "Professional",
                        profilePic: commenterProfile?.profilePic || "",
                        headline: commenterProfile?.headline || ""
                    }
                };
            }));

            return {
                _id: post._id,
                content: post.content,
                image: post.image,
                likes: post.likes,
                comments: enrichedComments,
                createdAt: post.createdAt,
                author: {
                    _id: author?._id,
                    name: author?.name || "Professional",
                    role: author?.role || "user",
                    isBlocked: author?.isBlocked || false,
                    profilePic: profile?.profilePic || "",
                    headline: profile?.headline || ""
                }
            };
        }));

        res.json(enrichedPosts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserPosts = async (req, res) => {
    try {
        const targetUserId = req.query.userId || req.id;
        const posts = await Post.find({ userId: targetUserId }).sort({ createdAt: -1 });

        const enrichedPosts = await Promise.all(posts.map(async (post) => {
            const author = await User.findById(post.userId).select("name role");
            const profile = await Profile.findOne({ userId: post.userId }).select("profilePic headline");

            const enrichedComments = await Promise.all((post.comments || []).map(async (comment) => {
                const commenter = await User.findById(comment.userId).select("name");
                const commenterProfile = await Profile.findOne({ userId: comment.userId }).select("profilePic headline");
                return {
                    _id: comment._id,
                    text: comment.text,
                    createdAt: comment.createdAt,
                    userId: comment.userId,
                    author: {
                        name: commenter?.name || "Professional",
                        profilePic: commenterProfile?.profilePic || "",
                        headline: commenterProfile?.headline || ""
                    }
                };
            }));

            return {
                _id: post._id,
                content: post.content,
                image: post.image,
                likes: post.likes,
                comments: enrichedComments,
                createdAt: post.createdAt,
                author: {
                    _id: author?._id,
                    name: author?.name || "Professional",
                    role: author?.role || "user",
                    profilePic: profile?.profilePic || "",
                    headline: profile?.headline || ""
                }
            };
        }));

        res.json(enrichedPosts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const index = post.likes.findIndex(id => id.toString() === req.id);
        if (index === -1) {
            post.likes.push(req.id);

            if (post.userId.toString() !== req.id) {
                await Notification.create({
                    receiverId: post.userId,
                    senderId: req.id,
                    type: "like",
                    postId: post._id
                });
            }
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Comment text is required" });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        post.comments.push({
            userId: req.id,
            text: text.trim()
        });

        await post.save();

        if (post.userId.toString() !== req.id) {
            await Notification.create({
                receiverId: post.userId,
                senderId: req.id,
                type: "comment",
                postId: post._id
            });
        }

        const enrichedComments = await Promise.all(post.comments.map(async (comment) => {
            const commenter = await User.findById(comment.userId).select("name");
            const profile = await Profile.findOne({ userId: comment.userId }).select("profilePic headline");
            return {
                _id: comment._id,
                text: comment.text,
                createdAt: comment.createdAt,
                userId: comment.userId,
                author: {
                    name: commenter?.name || "Professional",
                    profilePic: profile?.profilePic || "",
                    headline: profile?.headline || ""
                }
            };
        }));

        res.json(enrichedComments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const uploadPostImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const fileUrl = `http://localhost:3000/upload/${req.file.filename}`;
        res.json({ imageUrl: fileUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deletePost = async (req, res) => {
    try {
        const adminUser = await User.findById(req.id);
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        await Post.findByIdAndDelete(req.params.id);
        await Notification.deleteMany({ postId: req.params.id });

        res.json({ message: "Post successfully moderated and deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPost,
    getAllPosts,
    getUserPosts,
    likePost,
    addComment,
    uploadPostImage,
    deletePost
};
