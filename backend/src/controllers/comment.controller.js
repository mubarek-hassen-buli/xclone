import asyncHandler from "express-async-handler";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { getAuth } from "@clerk/express";
import Notification from "../models/notification.model.js";

export const getComment = asyncHandler(async (req, res) => {
  const postId = req.params;
  const comment = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture");

  if (!comment) return res.status(404).json({ message: "there is no comment" });
  res.status(200).json({ comment });
});

export const createComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;
  const { content } = req.body;
  if (!content || content.trim() == "") {
    return res.status(400).json({ error: "Comment cannot be empty" });
  }
  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);
  if (!user || !post)
    return res.status(404).json({ message: "user or post not found" });
  const comment = await Comment.create({
    user: user._id,
    post: post._id,
    content,
  });

  //Link the comment to the post

  await Post.findByIdAndUpdate(postId, {
    $push: { comments: comment._id },
  });

  // create notification if not commenting on own post

  if (post.user.toString() !== user._id.toString()) {
    await Notification.create({
      from: user._id,
      to: post.user,
      type: "comment",
      post: postId,
      comment: comment._id,
    });
  }

  res.status(201).json({ comment });
});

export const deleteComment = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { commentId } = req.params;
  
    const user = await User.findOne({ clerkId: userId });
    const comment = await Comment.findById(commentId);
  
    if (!user || !comment) {
      return res.status(404).json({ error: "User or comment not found" });
    }
  
    if (comment.user.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "You can only delete your own comments" });
    }
  
    // remove comment from post
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId },
    });
  
    // delete the comment
    await Comment.findByIdAndDelete(commentId);
  
    res.status(200).json({ message: "Comment deleted successfully" });
  });
  
