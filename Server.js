const express = require("express")
const mongoose = require("mongoose")

const UserRouter = require("./Router/UserRouter");
const PostRouter = require("./Router/PostRouter");
const ConnectionRouter = require("./Router/ConnectionRouter");
const NotificationRouter = require("./Router/NotificationRouter");
const SuperAdminRouter = require("./Router/SuperAdminRouter");


const cors = require("cors")
const connectDb = require("./Config/db")


require("dotenv").config();

process.env.SUPERADMIN_EMAIL = "superadmin@gmail.com";
process.env.SUPERADMIN_PASSWORD = "superadmin123";
process.env.SUPERADMIN_NAME = "Super Admin";

connectDb().then(() => {
    const seedSuperAdmin = require("./Utils/seedSuperAdmin");
    seedSuperAdmin();
}).catch(err => {
    console.error("Database connection failed:", err.message);
});

const app = express()

const PORT = process.env.PORT || 3000;
app.use(cors())
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const uploadDir = process.env.VERCEL ? "/tmp" : "uploads";
app.use("/upload", express.static(uploadDir));

app.use("/api/user", UserRouter);
app.use("/api/posts", PostRouter);
app.use("/api/connections", ConnectionRouter);
app.use("/api/notifications", NotificationRouter);
app.use("/api/superadmin", SuperAdminRouter);





app.get("/", (req, res) => {
    res.send("Server is Running");

});

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`server running on http://localhost:${PORT}`);

    })
}

module.exports = app;

