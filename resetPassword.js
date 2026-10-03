require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Patient = require("./src/models/Patient");

async function resetPassword() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const newPassword = await bcrypt.hash(
            "Test@123",
            10
        );

        const patient =
            await Patient.findOneAndUpdate(
                {
                    email: "testpatient2@example.com"
                },
                {
                    password_hash: newPassword
                },
                {
                    new: true
                }
            );

        if (!patient) {
            console.log("Patient not found");
        } else {
            console.log(
                "Password reset successfully!"
            );
        }

        await mongoose.disconnect();

    } catch (error) {
        console.error(
            "PASSWORD RESET ERROR:",
            error
        );
    }
}

resetPassword();