const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    getNotifications,
    markNotificationAsRead,
    getUnreadNotificationCount
} = require("../controllers/notificationController");

const router = express.Router();

// GET MY NOTIFICATIONS
router.get(
    "/",
    authMiddleware,
    getNotifications
);

// GET UNREAD NOTIFICATION COUNT
router.get(
    "/unread/count",
    authMiddleware,
    getUnreadNotificationCount
);

// MARK NOTIFICATION AS READ
router.put(
    "/:id/read",
    authMiddleware,
    markNotificationAsRead
);

module.exports = router;