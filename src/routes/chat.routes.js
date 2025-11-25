const express = require("express");
const authMiddleware = require("../middlwares/auth.middleware");
const { getAllFollowerForChat } = require("../controllers/chat.controller");

const router = express.Router();

 router.get("/all-followings",authMiddleware, getAllFollowerForChat);



module.exports = router;