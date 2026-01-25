import express from "express";
import cors from "cors";
import http from "http";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import socketServer from "./websocket/socket.js";
import "dotenv/config";
import notificationRoutes from "./routes/notificationRoutes.js"
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/messages", messageRoutes);
app.use("/notifications", notificationRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/friends", friendRoutes);

const server = http.createServer(app);
socketServer(server);

server.listen(5000, () => console.log("Server running on 5000"));
