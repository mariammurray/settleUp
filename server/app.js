import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
dotenv.config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const roomBets = new Map();

io.on("connection", (socket) => {
  // defining the events I will listen for on the frontend
  
  socket.on("submit-bet", ({ roomId, user, bet }) => {
    console.log(roomId, user, bet);
    if (!roomBets.has(roomId)) {
      roomBets.set(roomId, new Map());
    }
    roomBets.get(roomId).set(user, bet);
    const allBets = Array.from(roomBets.get(roomId), ([user, bet]) => ({ user, bet }));
    io.to(roomId).emit("bets-update", allBets);
  });

  socket.on("join-room", (roomId, user) => {
    socket.join(roomId);
    const bets = roomBets.get(roomId) || new Map();
    const allBets = Array.from(bets, ([user, bet]) => ({ user, bet }));
    socket.emit("bets-update", allBets);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});

