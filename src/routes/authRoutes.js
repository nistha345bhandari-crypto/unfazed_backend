const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    registerTherapist,
    loginTherapist,
    registerPatient,
    loginPatient
} = require("../controllers/authController");

const router = express.Router();

console.log("AUTH ROUTES LOADED");


// ===============================
// THERAPIST AUTH
// ===============================

router.post("/register", registerTherapist);

router.post("/login", loginTherapist);


// ===============================
// PATIENT AUTH
// ===============================

router.post("/registerPatient", registerPatient);

router.post("/loginPatient", loginPatient);


// ===============================
// THERAPIST AUTH CHECK
// ===============================

router.get("/me", authMiddleware, (req, res) => {

    res.json({
        message: "You are authenticated",
        therapist: req.therapist
    });

});


module.exports = router;