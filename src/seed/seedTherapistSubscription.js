const mongoose = require("mongoose");
require("dotenv").config();

const Subscription = require("../models/Subscription");

const therapistId =
    "6a98ccfd75b4c65703e938e7";

const seedTherapistSubscription = async () => {
    try {
        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "MongoDB connected for therapist subscription seed"
        );

        const expiryDate = new Date();

        expiryDate.setFullYear(
            expiryDate.getFullYear() + 1
        );

        await Subscription.findOneAndUpdate(
            {
                therapist: therapistId
            },
            {
                therapist: therapistId,
                tier: "professional",
                status: "active",
                startDate: new Date(),
                expiryDate
            },
            {
                upsert: true,
                new: true
            }
        );

        console.log(
            "Professional subscription created successfully"
        );

        process.exit(0);
    } catch (error) {
        console.error(
            "THERAPIST SUBSCRIPTION SEED ERROR:",
            error
        );

        process.exit(1);
    }
};

seedTherapistSubscription();