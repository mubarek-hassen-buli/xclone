import express from "express";
import {
  getPosts,
  getPost,
  getUserPosts,
  createPosts,
  likePost,
  deletePost
} from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
const router = express.Router();
//public routes
router.get("/", getPosts);
router.get("/:postId", getPost);
router.get("/user/:username", getUserPosts);
//protected routes
router.post("/", protectRoute, upload.single("image"), createPosts);
router.post("/:postId/like",protectRoute,likePost)
router.delete("/:postId", protectRoute, deletePost)
export default router;
