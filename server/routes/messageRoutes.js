import express from "express";
import Message from "../models/Message.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:friendId", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const friendId = req.params.friendId;

  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      {
        sender: friendId,
        receiver: userId,
        read: false
      },
      {
        $set: { read: true }
      }
    );

    const formattedMessages = messages.map(msg => {
      const msgSenderId = msg.sender.toString();
      const currentUserId = userId.toString();
      const isSender = msgSenderId === currentUserId;
      
      if (msg.type === 'image') {
        // Image message
        return {
          _id: msg._id,
          sender: msg.sender,
          receiver: msg.receiver,
          type: 'image',
          encryptedImage: msg.encryptedImage,
          // Return appropriate encrypted AES key based on who's requesting
          encryptedAESKey: isSender ? msg.senderEncryptedAESKey : msg.encryptedAESKey,
          imageMetadata: msg.imageMetadata,
          read: msg.read,
          createdAt: msg.createdAt
        };
      } else {
        // Text message
        return {
          _id: msg._id,
          sender: msg.sender,
          receiver: msg.receiver,
          type: 'text',
          text: isSender ? msg.senderText : msg.text,
          read: msg.read,
          createdAt: msg.createdAt
        };
      }
    });

    res.json(formattedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;