require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const taskRoutes = require("./routes/taskRoutes");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/tasks", taskRoutes);

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => console.log("Client disconnected"));
});

global.io = io;

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
