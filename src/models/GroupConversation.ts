import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: false},
    participants: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }],
    // To save time on searching
    latestMessage: {type: mongoose.Schema.Types.ObjectId, ref: "Message"},
    //For real group conversation
    lastMessageNotReadBy: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }],
    isGroupConversation: {type: Boolean, default: false},
    //admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
},{
    timestamps: true
});

const GroupConversation = mongoose.model("GroupConversation", userSchema);

module.exports = GroupConversation;