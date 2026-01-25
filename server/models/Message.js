import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  // Text message fields
  text: String, 
  senderText: String, 
  
  // Image message fields
  type: { type: String, enum: ['text', 'image'], default: 'text' },
  
  // Encrypted image data (base64)
  encryptedImage: String,
  
  // Encrypted AES key for receiver
  encryptedAESKey: String,
  
  // Encrypted AES key for sender (so sender can view their own sent images)
  senderEncryptedAESKey: String,
  
  // Original image metadata
  imageMetadata: {
    filename: String,
    mimetype: String,
    size: Number
  },
  
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Message", messageSchema);