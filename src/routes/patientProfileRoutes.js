console.log("✅ PATIENT PROFILE ROUTES LOADED");
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getPatientProfile,
    updatePatientProfile
} = require("../controllers/patientProfileController");

const router = express.Router();

// Get logged-in patient's profile
router.get(
    "/",
    authMiddleware,
    roleMiddleware("patient"),
    getPatientProfile
);

// Update logged-in patient's profile
router.put(
    "/",
    authMiddleware,
    roleMiddleware("patient"),
    updatePatientProfile
);

module.exports = router;