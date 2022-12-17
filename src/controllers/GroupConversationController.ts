import { Request, Response, NextFunction } from "express";

const GroupConversation = require("../models/GroupConversation");
const Message = require("../models/Message");
const User = require("../models/User");

async function getGroupConversations(req: Request, res: Response, next: NextFunction) {
  const user: any = req.user;

  const conversations = await GroupConversation.find({ participants: { $in: [user._id] } });

  res.status(200).json(conversations);
}

// privet
async function getLatestMessageToConversationsList(latestMessageId: string, userId: string) {

  if (latestMessageId === null || latestMessageId === undefined) {
    return null;
  }

  const latestMessageDb = await Message.findById(latestMessageId).select("text sender createdAt");

  const latestMessageSenderId = latestMessageDb.sender.toString();
  const latestMessageSender = await User.findById(latestMessageSenderId).select("username");
  const latestMessageSenderUsername = latestMessageSender.username;

  const latestMessage = {
    text: latestMessageDb.text,
    senderId: latestMessageSenderId,
    senderUsername: latestMessageSenderUsername,
    createdAt: latestMessageDb.createdAt
  }

  return latestMessage;
}

async function formatConversation(c: any, user: any) {
  const latestMessage = await getLatestMessageToConversationsList(c.latestMessage, user._id);

  let name: string;
  let imageUri: string;
  if (c.isGroupConversation) {
    name = c.name;
    imageUri = c.imageUri
  } else {
    const otherParticipantId = c.participants.find((p: any) => p.toString() !== user._id.toString());
    const otherParticipant = await User.findById(otherParticipantId).select("username imageUri");
    name = otherParticipant.username;
    imageUri = otherParticipant.imageUri;
  }

  const newConv = {
    id: c._id.toString(),
    name: name,
    group: c.isGroupConversation,
    imageUri: imageUri,
    isLastMessageNotRead: c.lastMessageNotReadBy?.includes(user._id),
    lastMessage: latestMessage
  };

  return newConv;
}

async function getGroupConversationsShort(req: Request, res: Response, next: NextFunction) {
  const user: any = req.user;

  const conversations = await GroupConversation.find({ participants: { $in: [user._id] } })
    .select("_id isGroupConversation name participants latestMessage lastMessageNotReadBy");

  const formatedConversations = await Promise.all(conversations.map(async (c: any) => await formatConversation(c, user)));

  res.status(200).json(formatedConversations);
}

async function createGroupConversation(req: Request, res: Response, next: NextFunction) {
  if (!req.body.participantsIds) {
    res.status(400)
    throw new Error("No participants in converation.");
  }

  const conversation = await GroupConversation.create({
    name: req.body.name,
    isGroupConversation: true,
    participants: req.body.participantsIds,
  });

  res.status(200).json({ message: "Conversation created" });
}

async function leaveGroupConversation(req: Request, res: Response, next: NextFunction) {
  const user: any = req.user;
  const conversation = await GroupConversation.findById(req.params.id);

  if (!conversation) {
    res.status(400);
    throw new Error(`Conversation with id: ${req.params.id} does not exist`);
  }

  GroupConversation.updateOne({ _id: conversation._id }, { $pull: { participants: user._id } });

  res.status(200).json({ message: `You leave conversation with id: ${req.params.id} has been deleted` })
}

const accessPrivateChat = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;
  const user: any = req.user;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  let isChat = await GroupConversation.findOne({
    isGroupConversation: false,
    $and: [
      { participants: { $elemMatch: { $eq: user._id } } },
      { participants: { $elemMatch: { $eq: userId } } },
    ],
  });

  if (isChat) {
    const formatedConversation = await formatConversation(isChat, user);
    res.send(formatedConversation);
  } else {
    let conversationData = {
      isGroupConversation: false,
      participants: [user._id, userId],
    };

    try {
      const createdConversation = await GroupConversation.create(conversationData);
      const formatedConversation = await formatConversation(await GroupConversation.findOne({ _id: createdConversation._id }), user);
      console.log(formatedConversation)
      res.status(200).json(formatedConversation);
    } catch (error: any) {
      res.status(400);
      throw new Error(error.message);
    }
  }
};


module.exports = {
  getGroupConversations,
  getGroupConversationsShort,
  createGroupConversation,
  leaveGroupConversation,
  accessPrivateChat,
}