const Subscription = require("../models/Subscription");
const SubscriptionTierConfig = require("../models/SubscriptionTierConfig");

const canAccess = async (therapistId, featureKey) => {
    try {
        const subscription =
            await Subscription.findOne({
                therapist: therapistId
            });

        if (!subscription) {
            return false;
        }

        if (subscription.status !== "active") {
            return false;
        }

        if (
            subscription.expiryDate &&
            new Date(subscription.expiryDate) < new Date()
        ) {
            return false;
        }

        const tierConfig =
            await SubscriptionTierConfig.findOne({
                tier: subscription.tier
            });

        if (!tierConfig) {
            return false;
        }

        return tierConfig.features.includes(
            featureKey
        );

    } catch (error) {
        console.error(
            "ENTITLEMENT CHECK ERROR:",
            error
        );

        return false;
    }
};

const getClientLimit = async (therapistId) => {
    try {
        const subscription =
            await Subscription.findOne({
                therapist: therapistId
            });

        if (!subscription) {
            return 0;
        }

        if (subscription.status !== "active") {
            return 0;
        }

        if (
            subscription.expiryDate &&
            new Date(subscription.expiryDate) < new Date()
        ) {
            return 0;
        }

        const tierConfig =
            await SubscriptionTierConfig.findOne({
                tier: subscription.tier
            });

        if (!tierConfig) {
            return 0;
        }

        return tierConfig.clientLimit;

    } catch (error) {
        console.error(
            "GET CLIENT LIMIT ERROR:",
            error
        );

        return 0;
    }
};

module.exports = {
    canAccess,
    getClientLimit
};