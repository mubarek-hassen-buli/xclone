import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import { clerkClient, getAuth } from "@clerk/express";
import Notification from "../models/notification.model.js";

export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({ user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const user = await User.findOneAndUpdate({ clerkId: userId }, req.body, {
    new: true,
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json({ user });
});
export const syncUser = asyncHandler(async (req, res) => {
  try {
    // Validate Clerk configuration
    if (!process.env.CLERK_SECRET_KEY) {
      console.error("❌ CLERK_SECRET_KEY is not configured!");
      return res.status(500).json({ 
        error: "Server configuration error: Missing Clerk API key" 
      });
    }

    const { userId } = getAuth(req);
    console.log("🔍 Syncing user with Clerk ID:", userId);
    
    if (!userId) {
      console.error("❌ No userId found in auth context");
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    //checking if the user exists in the mongodb
    const existingUser = await User.findOne({ clerkId: userId });
    if (existingUser) {
      console.log("✅ User already exists:", existingUser.username);
      return res.status(200).json({ message: "User already exists" });
    }
    
    console.log("📞 Fetching user from Clerk...");
    //creating new user from clerk data
    const clerkUser = await clerkClient.users.getUser(userId);
    console.log("✅ Clerk user fetched:", clerkUser.emailAddresses[0]?.emailAddress);

    // More robust username generation:
    // 1. Use Clerk username if it exists
    // 2. Fallback to email prefix
    // 3. Ensure it's unique by adding a random suffix if needed
    let baseUsername = clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress.split("@")[0] || "user";
    
    // Check for username collision in our DB
    const usernameExists = await User.findOne({ username: baseUsername });
    let finalUsername = baseUsername;
    if (usernameExists && usernameExists.clerkId !== userId) {
      finalUsername = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const userData = {
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      firstName: clerkUser.firstName || "User",
      lastName: clerkUser.lastName || "",
      username: finalUsername,
      profilePicture: clerkUser.imageUrl || "",
    };
    
    console.log("💾 Creating new user in MongoDB:", userData.username);
    const user = await User.create(userData);
    console.log("✅ User created successfully:", user._id);

    res.status(201).json({ user, message: "User created successfully" });
  } catch (error) {
    console.error("❌ Error in syncUser:", error.message);
    console.error("Error details:", {
      name: error.name,
      code: error.code,
      status: error.status
    });
    
    if (error.code === 11000) {
      console.error("Duplicate key error details:", error.keyValue);
    }
    
    // More specific error messages
    if (error.status === 401 || error.message?.includes("authentication")) {
      return res.status(500).json({ 
        error: "Clerk authentication failed - check API keys" 
      });
    }
    
    res.status(500).json({ error: error.message || "Failed to sync user" });
  }
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json({ user });
});

export const followUser = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { targetUserId } = req.params;

  if (userId === targetUserId)
    return res.status(400).json({ error: "You cannot follow yourself" });

  const currentUser = await User.findOne({ clerkId: userId });
  const targetUser = await User.findById(targetUserId);

  if (!currentUser || !targetUser)
    return res.status(404).json({ error: "User not found" });

  const isFollowing = currentUser.following.includes(targetUserId);

  if (isFollowing) {
    // unfollow
    await User.findByIdAndUpdate(currentUser._id, {
      $pull: { following: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUser._id },
    });
  } else {
    // follow
    await User.findByIdAndUpdate(currentUser._id, {
      $push: { following: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $push: { followers: currentUser._id },
    });

    // create notification
    await Notification.create({
      from: currentUser._id,
      to: targetUserId,
      type: "follow",
    });
  }

  res.status(200).json({
    message: isFollowing
      ? "User unfollowed successfully"
      : "User followed successfully",
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({ user });
});

export const searchUsers = asyncHandler(async (req, res) => {
  let { query } = req.query;
  console.log("🔍 Search query received:", query);

  if (!query || query.trim().length === 0) {
    return res.status(200).json({ users: [] });
  }

  // Strip leading '@' if present (common in Twitter searches)
  const cleanQuery = query.trim().startsWith("@") ? query.trim().slice(1) : query.trim();
  console.log("🧹 Cleaned search query:", cleanQuery);

  const users = await User.find({
    $or: [
      { username: { $regex: cleanQuery, $options: "i" } },
      { firstName: { $regex: cleanQuery, $options: "i" } },
      { lastName: { $regex: cleanQuery, $options: "i" } },
    ],
  })
    .select("username firstName lastName profilePicture bio followers")
    .limit(20);

  console.log(`✅ Found ${users.length} users for query: ${cleanQuery}`);

  res.status(200).json({ users });
});
