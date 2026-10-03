const { canAccess } = require("../services/entitlementService");

const entitlementMiddleware = (featureKey) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: "Not authenticated"
                });
            }

            if (req.user.role !== "therapist") {
                return res.status(403).json({
                    message: "Only therapists can access this feature"
                });
            }

            const allowed = await canAccess(
                req.user.id,
                featureKey
            );

            if (!allowed) {
                return res.status(403).json({
                    message: "Feature not available in your current subscription",
                    featureKey,
                    upgradeRequired: true
                });
            }

            next();
        } catch (error) {
            console.error(
                "ENTITLEMENT MIDDLEWARE ERROR:",
                error
            );

            res.status(500).json({
                message: "Failed to check feature access"
            });
        }
    };
};

module.exports = entitlementMiddleware;