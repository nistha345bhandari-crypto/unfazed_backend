
const Notification = require("../models/Notification");

// GET MY NOTIFICATIONS
const getNotifications = async (req, res) => {
    try {
        const recipientModel =
            req.user.role === "patient"
                ? "Patient"
                : "Therapist";

        const notifications = await Notification.find({
            recipient: req.user.id,
            recipientModel
        }).sort({
            createdAt: -1
        });

        res.status(200).json({
            notifications
        });

    } catch (error) {
        console.error("GET NOTIFICATIONS ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipient: req.user.id,
            recipientModel:
                req.user.role === "patient"
                    ? "Patient"
                    : "Therapist"
        });

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        notification.isRead = true;

        await notification.save();

        res.status(200).json({
            message: "Notification marked as read",
            notification
        });

    } catch (error) {
        console.error(
            "MARK NOTIFICATION READ ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};
const getUnreadNotificationCount = async (req, res) => {
    try {
        const recipientModel =
            req.user.role === "patient"
                ? "Patient"
                : "Therapist";

        const unreadCount = await Notification.countDocuments({
            recipient: req.user.id,
            recipientModel,
            isRead: false
        });

        res.status(200).json({
            unreadCount
        });

    } catch (error) {
        console.error(
            "GET UNREAD NOTIFICATION COUNT ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};
module.exports = {
    getNotifications,
     markNotificationAsRead,
     getUnreadNotificationCount
};