  const express = require("express");
  const cors = require("cors");
  const path = require("path");
  const cookieParser = require("cookie-parser");   // ⭐ yaha import


  const AuthRoute = require("./routes/auth.routes");
  const PostRoute = require("./routes/post.route");
  const UserRoute = require("./routes/user.route");
  const ChatRoute = require("./routes/chat.routes");
  const TrackRoute = require("./routes/track.routes");

  const app = express();

  // ⭐ CORS OPTIONS
  const allowedOrigins = [
    "http://localhost:5173",
    "https://project-1-three-orpin.vercel.app",
    "https://prdigitalcms.in",
    "https://www.prdigitalcms.in",
  ];

  const corsOptions = {
    origin: function (origin, callback) {
      // Postman / server-side calls ke liye origin null ho sakta hai
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };

  // ⭐ CORS middleware – sabse upar
  app.use(cors(corsOptions));
  app.use(cookieParser());

  // Preflight ke liye
  // ⭐ Cookie Parser

  // ⭐ JSON Body Parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ⭐ Views
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));

  // ⭐ API Routes with `/api` prefix
  app.use("/api/auth", AuthRoute);
  app.use("/api/post", PostRoute);
  app.use("/api/user", UserRoute);
  app.use("/api/chats", ChatRoute);
  app.use("/api/tracks", TrackRoute);

  module.exports = app;
