const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        therapist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Therapist",
            required: true
        },

        // Package information
        packageType: {
            type: String,
            enum: ["3", "6", "12"],
            required: true
        },

        sessionsPurchased: {
            type: Number,
            required: true
        },

        sessionsRemaining: {
            type: Number,
            required: true
        },

        // Payment information
        amount: {
            type: Number,
            required: true
        },

        currency: {
            type: String,
            default: "INR"
        },

        razorpayOrderId: {
            type: String,
            default: ""
        },

        razorpayPaymentId: {
            type: String,
            default: ""
        },

        razorpaySignature: {
            type: String,
            default: ""
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending"
        },

        // Package validity
        purchaseDate: {
            type: Date,
            default: Date.now
        },

        expiryDate: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Payment",
    paymentSchema
);