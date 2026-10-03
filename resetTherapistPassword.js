require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const Therapist = require("./src/models/Therapist");

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const newPassword = "Ananya@12345";

        const password_hash = await bcrypt.hash(newPassword, 10);

        const therapist = await Therapist.findOneAndUpdate(
            {
                email: "ananya@example.com"
            },
            {
                password_hash
            },
            {
                new: true
            }
        );

        if (!therapist) {
            console.log("Therapist not found");
            process.exit(1);
        }

        console.log("Password reset successfully!");
        console.log("Email:", therapist.email);
        console.log("New password:", newPassword);

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error("ERROR:", error);
        process.exit(1);
    }
};

resetPassword();