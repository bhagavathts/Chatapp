import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/search", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({
      name: { $regex: req.query.q, $options: "i" }
    }).select("_id name");
    res.json(users);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

router.get("/public-key/:userId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("publicKey");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ publicKey: user.publicKey });
  } catch (error) {
    console.error("Public key fetch error:", error);
    res.status(500).json({ error: "Failed to fetch public key" });
  }
});

router.get("/my-keys", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("publicKey privateKey");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ 
      publicKey: user.publicKey,
      privateKey: user.privateKey 
    });
  } catch (error) {
    console.error("Keys fetch error:", error);
    res.status(500).json({ error: "Failed to fetch keys" });
  }
});

export default router;