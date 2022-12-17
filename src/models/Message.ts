import mongoose from "mongoose";

const messageShema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    conversation: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "GroupConversation" },
    text: { type: String, required: true },
}, {
    timestamps: true
});

module.exports = mongoose.model("Message", messageShema);