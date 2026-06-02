const mongoose = require("mongoose");
const User = require("./Model/Usermodel");
const connectDb = require("./config/db");
require("dotenv").config();

const email = process.argv[2];

if (!email) {
    console.error("Please provide the email address to promote: node promote-superadmin.js <email>");
    process.exit(1);
}

const promote = async () => {
    try {
        await connectDb();
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = "superadmin";
        await user.save();
        console.log(`Successfully promoted ${user.name} (${user.email}) to superadmin.`);
        process.exit(0);
    } catch (error) {
        console.error("Error promoting user:", error);
        process.exit(1);
    }
};

promote();
