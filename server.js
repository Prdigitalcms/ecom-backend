require("dotenv").config();
const app = require("./src/app");
const http = require("http");
const socketIo = require("socket.io");
const connectDb = require("./src/db/db");
const cacheClient = require("./src/services/chache.service");
const messageModel = require("./src/models/message.model");

const server = http.createServer(app);
const port = process.env.PORT || 5000;

// ✅ Connect to DB
connectDb();


// ✅ Redis loggers
cacheClient.on("connect", () => {
  console.log("Redis connected successfully");
});
cacheClient.on("error", (error) => {
  console.log("Error connecting Redis:", error);
});

// ✅ Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://ecom-project-rahul.vercel.app/",
      // "https://prdigitalcms.in",
      // "https://www.prdigitalcms.in"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  }
});


const onlineUsers = [];

// ✅ Socket events
io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  // send socket id to client
  socket.emit("teke_SID", socket.id);

  // 🧩 join room event
  socket.on("join-room", async (chatUsers) => {
    socket.join(chatUsers.roomId);

    if (chatUsers.socket_id) onlineUsers.push(chatUsers.socket_id);

    console.log("📦 User joined room:", chatUsers.roomId);
    console.log("🟢 Online users:", onlineUsers);

    // 🧠 Fetch old messages from DB
    try {
      const oldMessages = await messageModel
        .find({ room_id: chatUsers.roomId })
        .sort({ createdAt: 1 });

      // 📨 Send messages back
      socket.emit("load-old-messages", oldMessages);
    } catch (error) {
      console.error("Error fetching old messages:", error);
    }
  });

  // 📨 Handle send message
  socket.on("send-msg", async (msg) => {
    console.log("💬 Incoming message:", msg);
    try {
      const newMessage = await messageModel.create({
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        room_id: msg.roomId,
        content: msg.text,
      });

      // ✅ Send saved message (with _id, timestamps)
      io.to(msg.roomId).emit("receive-msg", newMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // disconnect event
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ✅ Start server
server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
