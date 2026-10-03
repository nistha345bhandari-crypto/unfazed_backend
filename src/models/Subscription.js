const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
    {
        therapist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Therapist",
            required: true,
            unique: true
        },

        tier: {
            type: String,
            enum: [
                "basic",
                "professional",
                "premium"
            ],
            default: "basic"
        },

        status: {
            type: String,
            enum: [
                "active",
                "expired",
                "cancelled"
            ],
            default: "active"
        },

        startDate: {
            type: Date,
            default: Date.now
        },

        expiryDate: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "Subscription",
        subscriptionSchema
    );