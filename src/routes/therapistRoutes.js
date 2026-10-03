
const express = require("express");

const {
    getTherapistProfile,
    updateTherapistProfile,
    getPublicTherapist,
    getAllTherapists
} = require("../controllers/therapistController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const entitlementMiddleware = require("../middleware/entitlementMiddleware");

const router = express.Router();


// Get all therapists for patient booking
router.get(
    "/",
    getAllTherapists
);


// Therapist profile
router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("therapist"),
    getTherapistProfile
);


// Update therapist profile
router.put(
    "/profile",
    authMiddleware,
    roleMiddleware("therapist"),
    updateTherapistProfile
);


// Public therapist profile
router.get(
    "/public/:slug",
    getPublicTherapist
);

router.get(
    "/test-entitlement",
    authMiddleware,
    roleMiddleware("therapist"),
    entitlementMiddleware("analytics_basic"),
    (req, res) => {
        res.json({
            message: "Analytics feature access granted!",
            feature: "analytics_basic"
        });
    }
);
module.exports = router;