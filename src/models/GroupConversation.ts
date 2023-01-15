import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: false},
    participants: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }],
    latestMessage: {type: mongoose.Schema.Types.ObjectId, ref: "Message"},
    //For real group conversation
    lastMessageNotReadBy: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }],
    isGroupConversation: {type: Boolean, default: false},
},{
    timestamps: true
});

const GroupConversation = mongoose.model("GroupConversation", userSchema);

module.exports = GroupConversation;