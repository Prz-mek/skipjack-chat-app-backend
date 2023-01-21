import express, { Application } from "express";
import connectToDatabase from "./config/DatabaseConnection";
const GroupConversation = require("./models/GroupConversation");

const { formatMessageToMessageList } = require("./controllers/MessageController");

const { errorHandler } = require('./middleware/errorMiddleware');

const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();


const PORT = process.env.PORT || 5000;
const app: Application = express();

app.use(cors());
app.use(express.json());

// avatar storage
app.use(express.static('files'));

connectToDatabase();

app.use('/api/users', require('./routes/UserRoutes'));
app.use('/api/conversations', require('./routes/ConversationRoutes'));
app.use('/api/messages', require('./routes/MessageRoutes'));
app.use('/api/auth', require('./routes/AuthRoutes'));

const server = require('http').createServer(app);

app.use(errorHandler);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// socket.io
const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*"
    },
});

const User = require("./models/User");
const Message = require("./models/Message");
const jwt = require("jsonwebtoken");

interface IApiMessage {
    sender: string;
    conversation: string;
    text: string
}

io.use(async (socket: any, next: any) => {
    const token = socket.handshake.auth.token;
    if (token && token.startsWith("Bearer")) {
        // TODO add try catch
        let tokenWithoutPrefix = token.split(" ")[1];
        const decoded = jwt.verify(tokenWithoutPrefix, process.env.ACCESS_SECRET);
        const user = await User.findById(decoded.id).select("_id username");
        socket.userID = decoded.id;
        socket.username = user.username;
        next();
    } else {
        next(new Error("Not authorized, no token"));
    }
});

io.on("connection", (socket: any) => {
    socket.join(socket.userID);

    socket.on("send-message", async (message: IApiMessage) => {
        try {
            const messageDb = await Message.create({
                sender: message.sender,
                conversation: message.conversation,
                text: message.text,
                read: [message.sender]
            });

            const formatedMessage = await formatMessageToMessageList(messageDb, socket.userID);

            const conversation = await GroupConversation.findById(message.conversation).select("participants");
            // shortcut
            const notSeenBy: string[] = [];
            conversation.participants.forEach((recipiant: string) => {
                const room = recipiant.toString();
                if (room !== message.sender) {
                    notSeenBy.push(room);
                }
                io.in(room).emit("receive-message", { conversationId: message.conversation, message: formatedMessage });
            });

            await GroupConversation.updateOne({ _id: message.conversation }, { $set: { latestMessage: messageDb._id, lastMessageNotReadBy: notSeenBy }  });
        } catch (err) {
            console.log(err);
        }
    });

    socket.on("seen-conversation", async (conversationId: string) => {
        console.log("id: " + socket.userID);
        const conversation = await GroupConversation.findById(conversationId).select("lastMessageNotReadBy");
        console.log("conversation: " + conversation.lastMessageNotReadBy);
        const newList = conversation.lastMessageNotReadBy.filter((e:any) => e.toString() !== socket.userID);
        console.log(newList);
        await GroupConversation.updateOne({ _id: conversationId }, { lastMessageNotReadBy: newList });
    });

    socket.on("disconnect", () => {
        console.log("USER DISCONNECTED");
    });
});
