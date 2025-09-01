import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {getComment,createComment,deleteComment} from "../controllers/comment.controller.js"


const router = express.Router();

//public routes

router.get("/post/:postId",getComment)

//protected routes
router.post("/post/:postId",protectRoute,createComment)
router.delete("/:commentId",protectRoute,deleteComment)

export default router;