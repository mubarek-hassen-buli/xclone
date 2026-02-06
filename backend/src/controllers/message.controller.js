import asyncHandler from "express-async-handler";
import { getAuth } from "@clerk/express";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";

// Get all conversations for current user
export const getConversations = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const user = await User.findOne({ clerkId: userId });
  
  if (!user) return res.status(404).json({ error: "User not found" });

  const conversations = await Conversation.find({
    participants: user._id,
  })
    .populate("participants", "username firstName lastName profilePicture")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  res.status(200).json({ conversations });
});

// Get messages for a specific conversation
export const getMessages = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { conversationId } = req.params;
  const user = await User.findOne({ clerkId: userId });

  if (!user) return res.status(404).json({ error: "User not found" });

  // Verify user is part of conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: user._id,
  });

  if (!conversation) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "username firstName lastName profilePicture")
    .sort({ createdAt: 1 });

  res.status(200).json({ messages });
});

// Send a message
export const sendMessage = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { recipientId, content } = req.body;
  const user = await User.findOne({ clerkId: userId });

  if (!user) return res.status(404).json({ error: "User not found" });

  // 1. Ensure IDs are sorted for consistent comparison/indexing
  const participants = [user._id.toString(), recipientId.toString()].sort();

  // 2. Find or create conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [user._id, recipientId], $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: participants,
    });
  }

  // 3. Create message
  const message = await Message.create({
    conversation: conversation._id,
    sender: user._id,
    content,
  });

  // 4. Update conversation's last message
  conversation.lastMessage = message._id;
  await conversation.save();

  const populatedMessage = await Message.findById(message._id).populate(
    "sender",
    "username firstName lastName profilePicture"
  );

  res.status(201).json({ message: populatedMessage });
});

// Delete a conversation
export const deleteConversation = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { conversationId } = req.params;
  const user = await User.findOne({ clerkId: userId });

  if (!user) return res.status(404).json({ error: "User not found" });

  const conversation = await Conversation.findOneAndDelete({
    _id: conversationId,
    participants: user._id,
  });

  if (!conversation) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  // Delete all messages in conversation
  await Message.deleteMany({ conversation: conversationId });

  res.status(200).json({ message: "Conversation deleted successfully" });
});
