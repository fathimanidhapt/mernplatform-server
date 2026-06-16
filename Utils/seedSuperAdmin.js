const bcrypt = require("bcryptjs");
const User = require("../Model/Usermodel");
const Profile = require("../Model/Profilemodel");

const seedSuperAdmin = async () => {
    try {
        const email = (process.env.SUPERADMIN_EMAIL || "superadmin@gmail.com").toLowerCase().trim();
        const name = process.env.SUPERADMIN_NAME || "Super Admin";
        const password = process.env.SUPERADMIN_PASSWORD || "superadmin123";

        const existingSuperAdmin = await User.findOne({ role: "superadmin" });
        if (existingSuperAdmin) {
            const isPasswordMatch = await bcrypt.compare(password, existingSuperAdmin.password);
            if (existingSuperAdmin.email !== email || !isPasswordMatch) {
                existingSuperAdmin.email = email;
                existingSuperAdmin.name = name;
                existingSuperAdmin.password = await bcrypt.hash(password, 10);
                await existingSuperAdmin.save();
                console.log("Updated SuperAdmin credentials in DB.");
            } else {
                console.log("SuperAdmin account already exists in DB.");
            }
            return;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            existingUser.role = "superadmin";
            await existingUser.save();
            console.log(`Updated existing user ${existingUser.name} to superadmin role.`);
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const superadmin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "superadmin"
        });

        await Profile.create({
            userId: superadmin._id,
            headline: "Platform Owner",
            location: "System Generated"
        });

        console.log(`SuperAdmin seeded successfully: ${superadmin.email}`);
    } catch (error) {
        console.error("Error seeding SuperAdmin:", error);
    }
};

module.exports = seedSuperAdmin;
