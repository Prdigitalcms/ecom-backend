const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({

})

const chatModel = mongoose.Model("chat",chatSchema);
module.exports = chatModel;