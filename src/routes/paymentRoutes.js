const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createPayment,
    createRazorpayOrder,
    verifyRazorpayPayment,
    getPatientPayments,
    getTherapistPayments,
    getActivePatientPackages,
    razorpayWebhook,
    downloadInvoice
} = require("../controllers/paymentController");

const router = express.Router();
router.post(
    "/webhook",
    razorpayWebhook
);

router.post(
    "/create-order",
    authMiddleware,
    roleMiddleware("patient"),
    createRazorpayOrder
);
router.post(
    "/verify",
    authMiddleware,
    roleMiddleware("patient"),
    verifyRazorpayPayment
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware("patient"),
    createPayment
);

router.get(
    "/patient",
    authMiddleware,
    roleMiddleware("patient"),
    getPatientPayments
);
router.get(
    "/patient/active",
    authMiddleware,
    roleMiddleware("patient"),
    getActivePatientPackages
);


router.get(
    "/therapist",
    authMiddleware,
    roleMiddleware("therapist"),
    getTherapistPayments
);
router.get(
    "/invoice/:paymentId",
    authMiddleware,
    roleMiddleware("patient"),
    downloadInvoice
);

module.exports = router;