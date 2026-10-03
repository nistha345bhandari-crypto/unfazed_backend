const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "senderModel"
        },

        senderModel: {
            type: String,
            required: true,
            enum: ["Patient", "Therapist"]
        },

        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "receiverModel"
        },

        receiverModel: {
            type: String,
            required: true,
            enum: ["Patient", "Therapist"]
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

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;