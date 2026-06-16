const mongoose = require("mongoose");

const connectDb = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI environment variable is not defined!");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected");
};

module.exports = connectDb;