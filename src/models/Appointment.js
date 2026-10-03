const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        therapist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Therapist",
            required: true
        },

availability: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Availability",
    required: false
},
payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: false
},

        patientName: {
            type: String,
            required: true,
            trim: true
        },

        patientEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        date: {
            type: Date,
            required: true
        },
        startTime: {
            type: String,
            required: true
        },

        endTime: {
            type: String,
             required: true
        },

        message: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;