require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const taskRoutes = require("./routes/taskRoutes");
// const multer = require("multer");
// const fs = require("fs");
// const speech = require("@google-cloud/speech");
// const http = require("http");
// const { Server } = require("socket.io");

connectDB();
const app = express();

app.use(express.json());
app.use(
  cors({ origin: "https://ai4-bureaucrats.vercel.app", credentials: true })
);
app.use(cookieParser());

// const server = http.createServer(app);

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);

//   // Initialize WebSockets AFTER server is running
//   const io = new Server(server, {
//     cors: {
//       origin: "http://localhost:8080", // Adjust based on your frontend URL
//       methods: ["GET", "POST"],
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log("⚡ Client Connected:", socket.id);

//     socket.on("disconnect", () => {
//       console.log("❌ Client Disconnected:", socket.id);
//     });
//   });

//   // Export WebSocket instance for use in controllers
//   module.exports = { io };
// });
