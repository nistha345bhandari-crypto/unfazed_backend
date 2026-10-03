const Message = require("../models/Message");
const Patient = require("../models/Patient");
const Therapist = require("../models/Therapist");

// SEND MESSAGE
const sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;

        if (!receiverId || !message) {
            return res.status(400).json({
                message: "Receiver ID and message are required"
            });
        }

        let receiver;
        let receiverModel;

        if (req.user.role === "patient") {
            receiver = await Therapist.findById(receiverId);
            receiverModel = "Therapist";
        } else if (req.user.role === "therapist") {
            receiver = await Patient.findById(receiverId);
            receiverModel = "Patient";
        } else {
            return res.status(403).json({
                message: "Invalid user role"
            });
        }

        if (!receiver) {
            return res.status(404).json({
                message: "Receiver not found"
            });
        }

        const senderModel =
            req.user.role === "patient"
                ? "Patient"
                : "Therapist";

        const newMessage = await Message.create({
            sender: req.user.id,
            senderModel,
            receiver: receiverId,
            receiverModel,
            message
        });

        res.status(201).json({
            message: "Message sent successfully",
            data: newMessage
        });
    } catch (error) {
        console.error("SEND MESSAGE ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const getConversationMessages = async (req, res) => {
    try {
        const { userId } = req.params;

        const currentUserModel =
            req.user.role === "patient"
                ? "Patient"
                : "Therapist";

        const otherUserModel =
            req.user.role === "patient"
                ? "Therapist"
                : "Patient";

        const messages = await Message.find({
            $or: [
                {
                    sender: req.user.id,
                    senderModel: currentUserModel,
                    receiver: userId,
                    receiverModel: otherUserModel
                },
                {
                    sender: userId,
                    senderModel: otherUserModel,
                    receiver: req.user.id,
                    receiverModel: currentUserModel
                }
            ]
        }).sort({
            createdAt: 1
        });

        res.status(200).json({
            messages
        });

    } catch (error) {
        console.error("GET MESSAGES ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
// MARK MESSAGES AS READ
const markMessagesAsRead = async (req, res) => {
    try {
        const { userId } = req.params;

        const currentUserModel =
            req.user.role === "patient"
                ? "Patient"
                : "Therapist";

        const otherUserModel =
            req.user.role === "patient"
                ? "Therapist"
                : "Patient";

        const result = await Message.updateMany(
            {
                sender: userId,
                senderModel: otherUserModel,
                receiver: req.user.id,
                receiverModel: currentUserModel,
                isRead: false
            },
            {
                $set: { isRead: true }
            }
        );

        res.status(200).json({
            message: "Messages marked as read",
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error("MARK MESSAGES READ ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
// GET UNREAD MESSAGE COUNT
const getUnreadMessageCount = async (req, res) => {
    try {
        const unreadCount = await Message.countDocuments({
            receiver: req.user.id,
            receiverModel:
                req.user.role === "patient"
                    ? "Patient"
                    : "Therapist",
            isRead: false
        });

        res.status(200).json({
            unreadCount
        });

    } catch (error) {
        console.error("GET UNREAD COUNT ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
module.exports = {
    sendMessage,
    getConversationMessages,
    markMessagesAsRead,
    getUnreadMessageCount
};