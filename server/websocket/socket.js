import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import Message from "../models/Message.js";

const clients = new Map();

const socketServer = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    const token = req.url.split("token=")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);

    clients.set(user.id, ws);

    ws.on("message", async (msg) => {
      const data = JSON.parse(msg);
      const { to, type, text, textForSender, encryptedImage, encryptedAESKey, senderEncryptedAESKey, imageMetadata } = data;

      // Create message based on type
      if (type === 'image') {
        // Image message
        await Message.create({
          sender: user.id,
          receiver: to,
          type: 'image',
          encryptedImage: encryptedImage,
          encryptedAESKey: encryptedAESKey,
          senderEncryptedAESKey: senderEncryptedAESKey,
          imageMetadata: imageMetadata
        });

        // Send to recipient
        if (clients.has(to)) {
          clients.get(to).send(
            JSON.stringify({
              from: user.id,
              type: 'image',
              encryptedImage: encryptedImage,
              encryptedAESKey: encryptedAESKey,
              imageMetadata: imageMetadata
            })
          );
        }
      } else {
        // Text message
        await Message.create({
          sender: user.id,
          receiver: to,
          type: 'text',
          text: text,
          senderText: textForSender
        });

        // Send to recipient
        if (clients.has(to)) {
          clients.get(to).send(
            JSON.stringify({
              from: user.id,
              type: 'text',
              text: text
            })
          );
        }
      }
    });

    ws.on("close", () => clients.delete(user.id));
  });
};

export default socketServer;