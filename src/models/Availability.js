const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
    {
        therapist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Therapist",
            required: true
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

        isBooked: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Availability = mongoose.model(
    "Availability",
    availabilitySchema
);

module.exports = Availability;