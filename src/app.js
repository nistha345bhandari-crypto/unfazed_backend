const express = require("express");
const cors = require("cors");
const notificationRoutes = require("./routes/notificationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const therapistRoutes = require("./routes/therapistRoutes");
const patientAuthRoutes = require("./routes/patientAuthRoutes");
const authRoutes = require("./routes/authRoutes");
const patientProfileRoutes = require("./routes/patientProfileRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const sessionNoteRoutes = require("./routes/sessionNoteRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const entitlementRoutes = require("./routes/entitlementRoutes");
const path = require("path");
const app = express();
app.use(cors());

app.use(
    "/api/payments/webhook",
    express.raw({ type: "application/json" })
);

app.use(express.json());

app.use((req, res, next) => {
    console.log("REQUEST:", req.method, req.url);
    next();
});

const availabilityRoutes = require("./routes/availabilityRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/auth/patient", patientAuthRoutes);
app.use("/api/therapists", therapistRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/patient-profile", patientProfileRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/entitlements", entitlementRoutes);
app.get("/api/patient-profile-test", (req, res) => {
    res.json({ message: "PATIENT PROFILE TEST WORKS" });
});
console.log("✅ PATIENT PROFILE ROUTE MOUNTED");
app.get("/", (req, res) => {
    res.send("Unfazed API is running 🚀");
});
app.get("/test-payment.html", (req, res) => {
    res.sendFile(path.join(__dirname, "test-payment.html"));
});
app.use("/api/session-notes", sessionNoteRoutes);
module.exports = app;