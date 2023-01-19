import {Request, Response, NextFunction} from "express";

const Message = require("../models/Message");

async function getMessages(req: Request, res: Response, next: NextFunction) {
    const user: any = req.user;

    if (!req.body.conversationId) {
        res.status(400)
        throw new Error("No text in message");
    }
    const messages = await Message.find({ conversation: req.body.conversationId });

    const formatedMessages = await Promise.all(messages.map(async (m:  any) => await formatMessageToMessageList(m, user._id)));

    console.log(formatedMessages);

    res.status(200).json(formatedMessages);
}

// Like getLatestMessageToConversationsList code redundancy
const User = require("../models/User");

async function formatMessageToMessageList(message: any, userId: string) {
    if (message === null || message === undefined) {
        return null;
    }
    
    const messageSenderId = message.sender.toString();
    const messageSender = await User.findById(messageSenderId).select("username");
    const messageSenderUsername = messageSender.username;

    return {
        id: message._id,
        text: message.text,
        senderId: messageSenderId,
        senderUsername: messageSenderUsername,
        createdAt: message.createdAt
    }
}

async function updateMessage(req: Request, res: Response, next: NextFunction) {
    const message = await Message.findById(req.params.id);
    const user: any = req.user;


    if (!message) {
        res.status(400);
        throw new Error(`Message with id: ${req.params.id} does not exist`);
    }

    if (message.user.toString() !== user.id) {
        res.status(401);
        throw new Error("User not authorized");
    }

    const updatedMessage = await Message.findByIdAndUpdate(req.params.id, req.body, {new: true});

    res.status(200).json(updatedMessage);
}

async function deleteMessage(req: Request, res: Response, next: NextFunction) {
    const message = await Message.findById(req.params.id);
    const user: any = req.user;

    if (!message) {
        res.status(400);
        throw new Error(`Message with id: ${req.params.id} does not exist`);
    }

    if (message.user.toString() !== user.id) {
        res.status(401);
        throw new Error("User not authorized");
    }

    message.remove();

    res.status(200).json({message: `Message with id: ${req.params.id} has been deleted`})
}

module.exports = {
    getMessages,
    updateMessage,
    deleteMessage,
    formatMessageToMessageList,
}