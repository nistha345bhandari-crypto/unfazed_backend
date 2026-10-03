console.log("🔥 APPOINTMENT ROUTES LOADED");
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createAppointment,
    getTherapistAppointments,
    updateAppointmentStatus,
    getPatientAppointments,
    getAppointmentById,
    getPatientAppointmentById,
    cancelPatientAppointment,
    getTherapistClients,
    getTherapistClientById,
    getTherapistClientAppointments
} = require("../controllers/appointmentController");

const router = express.Router();

router.get("/test", (req, res) => {
    res.json({ message: "APPOINTMENT ROUTE WORKS" });
});
// ===============================
// PATIENT - CREATE APPOINTMENT
// ===============================
router.post(
    "/",
    authMiddleware,
    roleMiddleware("patient"),
    createAppointment
);


// ===============================
// THERAPIST - GET APPOINTMENTS
// ===============================
router.get(
    "/therapist",
    (req, res, next) => {
        console.log("🔥 THERAPIST ROUTE HIT");
        next();
    },
    authMiddleware,
    roleMiddleware("therapist"),
    getTherapistAppointments
);


// ===============================
// THERAPIST - UPDATE APPOINTMENT STATUS
// ===============================
router.put(
    "/:id/status",
    authMiddleware,
    roleMiddleware("therapist"),
    updateAppointmentStatus
);


// ===============================
// PATIENT - GET ALL APPOINTMENTS
// ===============================
router.get(
    "/patient",
    authMiddleware,
    roleMiddleware("patient"),
    getPatientAppointments
);


// ===============================
// PATIENT - GET SINGLE APPOINTMENT
// ===============================
router.get(
    "/patient/:id",
    authMiddleware,
    roleMiddleware("patient"),
    getPatientAppointmentById
);
router.delete(
    "/patient/:id",
    authMiddleware,
    roleMiddleware("patient"),
    cancelPatientAppointment
);
router.get(
    "/therapist/clients",
    authMiddleware,
    roleMiddleware("therapist"),
    getTherapistClients
);
router.get(
    "/therapist/clients/:id",
    authMiddleware,
    roleMiddleware("therapist"),
    getTherapistClientById
);
router.get(
    "/therapist/clients/:id/appointments",
    authMiddleware,
    roleMiddleware("therapist"),
    getTherapistClientAppointments
);
// ===============================
// THERAPIST - GET SINGLE APPOINTMENT
// ===============================
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("therapist"),
    getAppointmentById
);


module.exports = router;