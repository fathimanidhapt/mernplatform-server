const express=require("express")
const mongoose=require("mongoose")

const UserRouter=require("./Router/UserRouter");
const PostRouter=require("./Router/PostRouter");
const ConnectionRouter=require("./Router/ConnectionRouter");
const NotificationRouter=require("./Router/NotificationRouter");
const SuperAdminRouter=require("./Router/SuperAdminRouter");


const cors = require("cors")
const connectDb = require("./Config/db")


require("dotenv").config();
connectDb().then(() => {
    const seedSuperAdmin = require("./Utils/seedSuperAdmin");
    seedSuperAdmin();
});

const app=express()

const PORT = process.env.PORT || 3000;
app.use(cors())
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/upload",express.static("uploads"))

app.use("/api/user",UserRouter);
app.use("/api/posts",PostRouter);
app.use("/api/connections",ConnectionRouter);
app.use("/api/notifications",NotificationRouter);
app.use("/api/superadmin",SuperAdminRouter);





app.get("/",(req,res)=>{
    res.send("Server is Running");
 
});

// const PORT=process.env.PORT || 5000
app.listen(PORT,()=>{console.log(`server running on http://localhost:${PORT}`);
    
})

