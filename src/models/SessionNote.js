const mongoose = require("mongoose");

const sessionNoteSchema = new mongoose.Schema(
    {
        therapist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Therapist",
            required: true
        },

        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: true
        },

        title: {
            type: String,
            default: "",
            trim: true
        },

        content: {
            type: String,
            required: true
        },

        visibility: {
            type: String,
            enum: ["private", "shared"],
            default: "private"
        },

        noteType: {
            type: String,
            enum: ["general", "SOAP", "DAP"],
            default: "general"
        },

        subjective: {
            type: String,
            default: ""
        },

        objective: {
            type: String,
            default: ""
        },

        assessment: {
            type: String,
            default: ""
        },

        plan: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("SessionNote", sessionNoteSchema);