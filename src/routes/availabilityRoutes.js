const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    addAvailability,
    getTherapistAvailability,
    deleteAvailability
} = require("../controllers/availabilityController");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("therapist"),
    addAvailability
);


router.get(
    "/therapist/:therapistId",
    getTherapistAvailability
);
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("therapist"),
    deleteAvailability
);

module.exports = router;