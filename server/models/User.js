import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  publicKey: {
    type: String,
    required: true
  },
  
  privateKey: {
    type: String,
    required: true
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  
  // Friend requests sent by this user (pending)
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  
  // Friend requests received by this user (pending)
  receivedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

export default mongoose.model("User", userSchema);