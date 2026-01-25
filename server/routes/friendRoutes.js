import express from "express";
import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Send friend request
router.post("/request/:id", authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if current user exists
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ msg: "Current user not found" });
    }

    // Initialize arrays if they don't exist
    if (!currentUser.friends) currentUser.friends = [];
    if (!currentUser.sentRequests) currentUser.sentRequests = [];
    if (!currentUser.receivedRequests) currentUser.receivedRequests = [];

    if (!targetUser.friends) targetUser.friends = [];
    if (!targetUser.sentRequests) targetUser.sentRequests = [];
    if (!targetUser.receivedRequests) targetUser.receivedRequests = [];

    // Check if already friends
    if (currentUser.friends.includes(targetUserId)) {
      return res.status(400).json({ msg: "Already friends" });
    }

    // Check if request already exists
    const exists = await FriendRequest.findOne({
      from: currentUserId,
      to: targetUserId
    });

    if (exists) {
      return res.status(400).json({ msg: "Already sent" });
    }

    // Create friend request
    await FriendRequest.create({
      from: currentUserId,
      to: targetUserId
    });

    // Update sentRequests and receivedRequests
    await User.findByIdAndUpdate(currentUserId, { 
      $addToSet: { sentRequests: targetUserId } 
    });
    await User.findByIdAndUpdate(targetUserId, { 
      $addToSet: { receivedRequests: currentUserId } 
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Failed to send friend request" });
  }
});

// Accept friend request
router.post("/accept/:id", authMiddleware, async (req, res) => {
  try {
    const fr = await FriendRequest.findById(req.params.id);

    if (!fr) {
      return res.status(404).json({ msg: "Friend request not found" });
    }

    // Check if both users exist
    const fromUser = await User.findById(fr.from);
    const toUser = await User.findById(fr.to);
    
    if (!fromUser || !toUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Initialize arrays if they don't exist
    if (!fromUser.friends) fromUser.friends = [];
    if (!fromUser.sentRequests) fromUser.sentRequests = [];
    if (!toUser.friends) toUser.friends = [];
    if (!toUser.receivedRequests) toUser.receivedRequests = [];

    // Add to friends list
    await User.findByIdAndUpdate(fr.from, { 
      $push: { friends: fr.to },
      $pull: { sentRequests: fr.to }
    });
    await User.findByIdAndUpdate(fr.to, { 
      $push: { friends: fr.from },
      $pull: { receivedRequests: fr.from }
    });

    // Delete friend request
    await fr.deleteOne();
    res.sendStatus(200);
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ error: "Failed to accept friend request" });
  }
});

// Reject friend request
router.post("/reject/:id", authMiddleware, async (req, res) => {
  try {
    const fr = await FriendRequest.findById(req.params.id);

    if (!fr) {
      return res.status(404).json({ msg: "Friend request not found" });
    }

    // Remove from sentRequests and receivedRequests
    await User.findByIdAndUpdate(fr.from, { 
      $pull: { sentRequests: fr.to }
    });
    await User.findByIdAndUpdate(fr.to, { 
      $pull: { receivedRequests: fr.from }
    });

    // Delete friend request
    await FriendRequest.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ error: "Failed to reject friend request" });
  }
});

// Get pending friend requests (received)
router.get("/requests", authMiddleware, async (req, res) => {
  try {
    const requests = await FriendRequest.find({ to: req.user.id })
      .populate("from", "name");
    res.json(requests);
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ error: "Failed to fetch friend requests" });
  }
});

// Get friends list
router.get("/list", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("friends", "name");
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Ensure friends array exists
    if (!user.friends) {
      user.friends = [];
      await user.save();
    }

    res.json(user.friends);
  } catch (error) {
    console.error("Error fetching friends list:", error);
    res.status(500).json({ error: "Failed to fetch friends list" });
  }
});

// Check friendship status with a specific user
router.get("/status/:userId", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.userId;

    const currentUser = await User.findById(currentUserId);
    
    // Check if current user exists
    if (!currentUser) {
      return res.status(404).json({ msg: "Current user not found" });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Initialize arrays if they don't exist
    if (!currentUser.friends) currentUser.friends = [];
    if (!currentUser.sentRequests) currentUser.sentRequests = [];
    if (!currentUser.receivedRequests) currentUser.receivedRequests = [];

    // Check if already friends
    if (currentUser.friends.includes(targetUserId)) {
      return res.json({ status: "friends" });
    }

    // Check if request sent
    if (currentUser.sentRequests.includes(targetUserId)) {
      return res.json({ status: "pending" });
    }

    // Check if request received
    if (currentUser.receivedRequests.includes(targetUserId)) {
      return res.json({ status: "received" });
    }

    // No connection
    res.json({ status: "none" });
  } catch (error) {
    console.error("Error checking friendship status:", error);
    res.status(500).json({ error: "Failed to check friendship status" });
  }
});

// Remove friend
router.delete("/remove/:friendId", authMiddleware, async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const currentUserId = req.user.id;

    // Check if users exist
    const currentUser = await User.findById(currentUserId);
    const friendUser = await User.findById(friendId);
    
    if (!currentUser || !friendUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Remove from both users' friends lists
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { friends: friendId }
    });
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: currentUserId }
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ error: "Failed to remove friend" });
  }
});

export default router;