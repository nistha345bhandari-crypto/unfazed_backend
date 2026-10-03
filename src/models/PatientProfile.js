const mongoose = require("mongoose");

const patientProfileSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
            unique: true
        },

        // =========================
        // BASIC INFORMATION
        // =========================

        phone: {
            type: String,
            default: ""
        },

        dateOfBirth: {
            type: Date
        },

        gender: {
            type: String,
            default: ""
        },

        address: {
            type: String,
            default: ""
        },

        // =========================
        // EMERGENCY CONTACT
        // =========================

        emergencyContactName: {
            type: String,
            default: ""
        },

        emergencyContactPhone: {
            type: String,
            default: ""
        },

        // =========================
        // INTAKE INFORMATION
        // =========================

        presentingConcern: {
            type: String,
            default: ""
        },

        history: {
            type: String,
            default: ""
        },

        // =========================
        // CONSENT
        // =========================

        consentGiven: {
            type: Boolean,
            default: false
        },

        consentTimestamp: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "PatientProfile",
    patientProfileSchema
);