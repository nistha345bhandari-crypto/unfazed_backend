const mongoose = require("mongoose");

const subscriptionTierConfigSchema =
    new mongoose.Schema(
        {
            tier: {
                type: String,
                enum: [
                    "basic",
                    "professional",
                    "premium"
                ],
                required: true,
                unique: true
            },

            name: {
                type: String,
                required: true
            },

            price: {
                type: Number,
                required: true
            },

            features: {
                type: [String],
                default: []
            },

            clientLimit: {
                type: Number,
                required: true
            }
        },
        {
            timestamps: true
        }
    );

module.exports =
    mongoose.model(
        "SubscriptionTierConfig",
        subscriptionTierConfigSchema
    );