const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    checkEntitlement,
    checkClientLimit,
    updateSubscription,
    getCurrentSubscription
} = require("../controllers/entitlementController");

const router = express.Router();


// =====================================
// CHECK FEATURE ACCESS
// =====================================

router.get(
    "/check/:featureKey",
    authMiddleware,
    roleMiddleware("therapist"),
    checkEntitlement
);


// =====================================
// GET CLIENT LIMIT
// =====================================

router.get(
    "/client-limit",
    authMiddleware,
    roleMiddleware("therapist"),
    checkClientLimit
);

router.get(
    "/subscription",
    authMiddleware,
    roleMiddleware("therapist"),
    getCurrentSubscription
);
// =====================================
// UPDATE SUBSCRIPTION
// =====================================

router.put(
    "/subscription",
    authMiddleware,
    roleMiddleware("therapist"),
    updateSubscription
);


module.exports = router;