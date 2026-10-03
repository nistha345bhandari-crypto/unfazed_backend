const mongoose = require("mongoose");
require("dotenv").config();

const SubscriptionTierConfig = require("../models/SubscriptionTierConfig");

const tiers = [
    {
        tier: "basic",
        name: "Basic",
        price: 0,
        clientLimit: 10,
        features: [
            "active_client_cap",
            "note_template_basic",
            "analytics_basic"
        ]
    },

    {
        tier: "professional",
        name: "Professional",
        price: 999,
        clientLimit: 50,
        features: [
            "active_client_cap",
            "note_template_basic",
            "note_template_advanced",
            "analytics_basic",
            "analytics_advanced"
        ]
    },

    {
        tier: "premium",
        name: "Premium",
        price: 1999,
        clientLimit: 200,
        features: [
            "active_client_cap",
            "note_template_basic",
            "note_template_advanced",
            "analytics_basic",
            "analytics_advanced",
            "analytics_full"
        ]
    }
];

const seedSubscriptionTiers = async () => {
    try {
        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "MongoDB connected for subscription seed"
        );

        for (const tier of tiers) {
            await SubscriptionTierConfig.findOneAndUpdate(
                {
                    tier: tier.tier
                },
                tier,
                {
                    upsert: true,
                    new: true
                }
            );
        }

        console.log(
            "Subscription tiers seeded successfully"
        );

        process.exit(0);
    } catch (error) {
        console.error(
            "SUBSCRIPTION TIER SEED ERROR:",
            error
        );

        process.exit(1);
    }
};

seedSubscriptionTiers();