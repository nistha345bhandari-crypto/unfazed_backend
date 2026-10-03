const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "recipientModel"
        },

        recipientModel: {
            type: String,
            required: true,
            enum: ["Patient", "Therapist"]
        },

        type: {
            type: String,
            required: true,
            enum: [
                "message",
                "appointment_request",
                "appointment_accepted",
                "appointment_rejected",
                "appointment_completed",
                "appointment_cancelled"
            ]
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Notification = mongoose.model(
    "Notification",
    notificationSchema
);

module.exports = Notification;