const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    sendMessage,
    getConversationMessages,
     markMessagesAsRead,
      getUnreadMessageCount
} = require("../controllers/messageController");

const router = express.Router();

// SEND MESSAGE
router.post(
    "/",
    authMiddleware,
    sendMessage
);
// GET CONVERSATION MESSAGES
router.get(
    "/:userId",
    authMiddleware,
    getConversationMessages,
);
// GET UNREAD MESSAGE COUNT
router.get(
    "/unread/count",
    authMiddleware,
    getUnreadMessageCount
);
// MARK MESSAGES AS READ
router.put(
    "/:userId/read",
    authMiddleware,
    markMessagesAsRead
);
module.exports = router;
