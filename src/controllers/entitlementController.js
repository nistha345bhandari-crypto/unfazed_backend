const {
    canAccess,
    getClientLimit
} = require("../services/entitlementService");

const Subscription = require("../models/Subscription");


// =====================================
// CHECK FEATURE ENTITLEMENT
// =====================================

const checkEntitlement = async (req, res) => {

    try {

        const therapistId = req.user.id;

        const { featureKey } = req.params;

        const allowed = await canAccess(
            therapistId,
            featureKey
        );

        res.json({
            allowed,
            featureKey
        });

    } catch (error) {

        console.error(
            "CHECK ENTITLEMENT ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to check entitlement"
        });

    }

};


// =====================================
// CHECK CLIENT LIMIT
// =====================================

const checkClientLimit = async (req, res) => {

    try {

        const therapistId = req.user.id;

        const clientLimit =
            await getClientLimit(therapistId);

        res.json({
            clientLimit
        });

    } catch (error) {

        console.error(
            "CHECK CLIENT LIMIT ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to check client limit"
        });

    }

};


// =====================================
// UPDATE SUBSCRIPTION
// =====================================

const updateSubscription = async (req, res) => {

    try {

        const therapistId = req.user.id;

        const { tier } = req.body;


        // Validate tier

        const allowedTiers = [
            "basic",
            "professional",
            "premium"
        ];

        if (!allowedTiers.includes(tier)) {

            return res.status(400).json({
                message: "Invalid subscription tier"
            });

        }


        // Find therapist subscription

        let subscription =
            await Subscription.findOne({
                therapist: therapistId
            });


        // Create subscription if it doesn't exist

        if (!subscription) {

            subscription =
                new Subscription({

                    therapist: therapistId,

                    tier: tier,

                    status: "active",

                    startDate: new Date(),

                    expiryDate: new Date(
                        Date.now() +
                        365 * 24 * 60 * 60 * 1000
                    )

                });

        } else {

            // Update existing subscription

            subscription.tier = tier;

            subscription.status = "active";

            subscription.startDate = new Date();

            subscription.expiryDate = new Date(
                Date.now() +
                365 * 24 * 60 * 60 * 1000
            );

        }


        await subscription.save();


        res.json({

            message:
                "Subscription updated successfully",

            subscription: {

                tier: subscription.tier,

                status: subscription.status,

                startDate: subscription.startDate,

                expiryDate: subscription.expiryDate

            }

        });

    } catch (error) {

        console.error(
            "UPDATE SUBSCRIPTION ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Failed to update subscription"

        });

    }

};

// =====================================
// GET CURRENT SUBSCRIPTION
// =====================================

const getCurrentSubscription = async (req, res) => {
    try {
        const therapistId = req.user.id;

        const subscription =
            await Subscription.findOne({
                therapist: therapistId
            });

        if (!subscription) {
            return res.json({
                tier: "basic",
                status: "active"
            });
        }

        res.json({
            tier: subscription.tier,
            status: subscription.status,
            startDate: subscription.startDate,
            expiryDate: subscription.expiryDate
        });

    } catch (error) {

        console.error(
            "GET CURRENT SUBSCRIPTION ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to get current subscription"
        });
    }
};
module.exports = {

    checkEntitlement,

    checkClientLimit,

    updateSubscription,
    getCurrentSubscription

};