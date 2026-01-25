import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import { URL } from "url";

const clients = new Map();

const socketServer = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws, req) => {
    try {
      // ✅ Properly parse URL (IMPORTANT for production)
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get("token");

      if (!token) {
        console.log("❌ WebSocket rejected: No token");
        ws.close();
        return;
      }

      // ✅ Verify JWT safely
      let user;
      try {
        user = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        console.log("❌ WebSocket rejected: Invalid token");
        ws.close();
        return;
      }

      console.log("✅ WebSocket connected:", user.id);

      // Store client
      clients.set(user.id, ws);

      ws.on("message", async (msg) => {
        try {
          const data = JSON.parse(msg.toString());
          const {
            to,
            type,
            text,
            textForSender,
            encryptedImage,
            encryptedAESKey,
            senderEncryptedAESKey,
            imageMetadata,
          } = data;

          if (!to || !type) return;

          if (type === "image") {
            // Save image message
            await Message.create({
              sender: user.id,
              receiver: to,
              type: "image",
              encryptedImage,
              encryptedAESKey,
              senderEncryptedAESKey,
              imageMetadata,
            });

            // Send to recipient if online
            if (clients.has(to)) {
              clients.get(to).send(
                JSON.stringify({
                  from: user.id,
                  type: "image",
                  encryptedImage,
                  encryptedAESKey,
                  imageMetadata,
                })
              );
            }
          } else {
            // Save text message
            await Message.create({
              sender: user.id,
              receiver: to,
              type: "text",
              text,
              senderText: textForSender,
            });

            // Send to recipient if online
            if (clients.has(to)) {
              clients.get(to).send(
                JSON.stringify({
                  from: user.id,
                  type: "text",
                  text,
                })
              );
            }
          }
        } catch (err) {
          console.error("❌ WS message error:", err.message);
        }
      });

      ws.on("close", () => {
        console.log("🔌 WebSocket disconnected:", user.id);
        clients.delete(user.id);
      });

      ws.on("error", (err) => {
        console.error("❌ WS error:", err.message);
      });
    } catch (err) {
      console.error("❌ WS connection crash:", err.message);
      ws.close();
    }
  });

  console.log("✅ WebSocket server initialized");
};

export default socketServer;
