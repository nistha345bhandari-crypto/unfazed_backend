const express = require("express");

const {
    getAnalytics
} = require("../controllers/analyticsController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const entitlementMiddleware = require("../middleware/entitlementMiddleware");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    roleMiddleware("therapist"),
    entitlementMiddleware("analytics_basic"),
    getAnalytics
);

module.exports = router;