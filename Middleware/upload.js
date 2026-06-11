const multer = require("multer");
const path = require("path");

const uploadDir = process.env.VERCEL ? "/tmp" : "uploads";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

module.exports = multer({ storage }); 