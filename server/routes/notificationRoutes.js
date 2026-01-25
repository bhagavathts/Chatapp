import express from "express";
import Message from "../models/Message.js";
import FriendRequest from "../models/FriendRequest.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/counts", authMiddleware, async (req, res) => {
  const unreadChats = await Message.countDocuments({
    receiver: req.user.id,
    read: false
  });

  const friendRequests = await FriendRequest.countDocuments({
    to: req.user.id,
    status: "pending"
  });

  res.json({
    unreadChats,
    friendRequests
  });
});

export default router;
