import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getConversations,
  getMessages,
  sendMessage,
  deleteConversation,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/conversations", protectRoute, getConversations);
router.get("/conversations/:conversationId", protectRoute, getMessages);
router.post("/send", protectRoute, sendMessage);
router.delete("/conversations/:conversationId", protectRoute, deleteConversation);

export default router;
