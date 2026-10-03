const express = require("express");

const {
    createSessionNote,
    getPatientSessionNotes,
    getSessionNote,
    updateSessionNote,
    deleteSessionNote,
    getPatientSharedSessionNotes
} = require("../controllers/sessionNoteController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// Create session note
router.post(
    "/",
    authMiddleware,
    roleMiddleware("therapist"),
    createSessionNote
);
router.get(
    "/patient/shared",
    authMiddleware,
    roleMiddleware("patient"),
    getPatientSharedSessionNotes
);


// Get all notes for a patient
router.get(
    "/patient/:patientId",
    authMiddleware,
    roleMiddleware("therapist"),
    getPatientSessionNotes
);

// Get one session note
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("therapist"),
    getSessionNote
);


// Update session note
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("therapist"),
    updateSessionNote
);


// Delete session note
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("therapist"),
    deleteSessionNote
);


module.exports = router;