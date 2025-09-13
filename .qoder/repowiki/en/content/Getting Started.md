# Getting Started

<cite>
**Referenced Files in This Document**   
- [server.js](file://backend/src/server.js#L1-L48)
- [package.json](file://backend/package.json#L1-L27)
- [package.json](file://mobile/package.json#L1-L50)
- [env.js](file://backend/src/config/env.js#L1-L16)
- [app.json](file://mobile/app.json#L1-L43)
- [user.controller.js](file://backend/src/controllers/user.controller.js#L1-L97)
- [post.controller.js](file://backend/src/controllers/post.controller.js#L1-L159)
- [comment.controller.js](file://backend/src/controllers/comment.controller.js#L1-L84)
- [user.model.js](file://backend/src/models/user.model.js#L1-L64)
- [post.model.js](file://backend/src/models/post.model.js#L1-L37)
- [comment.model.js](file://backend/src/models/comment.model.js#L1-L32)
- [README.md](file://mobile/README.md#L1-L51)
- [_layout.tsx](file://mobile/app/_layout.tsx#L1-L14) - *Updated in recent commit*
- [index.tsx](file://mobile/app/(auth)/index.tsx#L1-L102) - *Updated in recent commit*
- [useSocialAuth.ts](file://mobile/hooks/useSocialAuth.ts#L1-L29) - *Added in recent commit*
</cite>

## Update Summary
- Added documentation for new authentication implementation using Clerk SSO
- Updated mobile application setup section to reflect new auth flow
- Enhanced environment configuration with Clerk SSO requirements
- Added new section on authentication flow and social login setup
- Updated section sources to include newly modified and added files

## Table of Contents
1. [Introduction](#introduction)
2. [Development Environment Setup](#development-environment-setup)
3. [Backend Installation and Configuration](#backend-installation-and-configuration)
4. [Mobile Application Setup](#mobile-application-setup)
5. [Environment Configuration](#environment-configuration)
6. [Authentication Implementation](#authentication-implementation)
7. [Running the Applications](#running-the-applications)
8. [Basic Usage Examples](#basic-usage-examples)
9. [Troubleshooting Guide](#troubleshooting-guide)

## Introduction
This guide provides step-by-step instructions for setting up the xClone development environment. The application consists of a Node.js backend and an Expo-based mobile frontend. This document covers installation, configuration, and basic usage to help developers get started quickly.

**Section sources**
- [server.js](file://backend/src/server.js#L1-L48)
- [package.json](file://backend/package.json#L1-L27)
- [package.json](file://mobile/package.json#L1-L50)

## Development Environment Setup

### Node.js Installation
Ensure you have Node.js (version 18 or higher) installed:
```bash
node --version
npm --version
```

### Expo CLI Installation
Install Expo CLI globally:
```bash
npm install -g expo-cli
```

### MongoDB Setup
1. Install MongoDB Community Edition or use MongoDB Atlas
2. For local development, start MongoDB service:
```bash
# On Windows
net start MongoDB

# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

**Section sources**
- [env.js](file://backend/src/config/env.js#L1-L16)
- [db.js](file://backend/src/config/db.js#L1-L11)

## Backend Installation and Configuration

### Navigate to Backend Directory
```bash
cd backend
```

### Install Dependencies
```bash
npm install
```

### Available Scripts
Based on the `package.json` file, the following scripts are available:

**Key Scripts:**
- `npm run dev`: Start development server with hot reload
- `npm start`: Start production server

```json
"scripts": {
  "dev": "node --watch src/server.js",
  "start": "node src/server.js"
}
```

**Section sources**
- [package.json](file://backend/package.json#L1-L27)
- [server.js](file://backend/src/server.js#L1-L48)

## Mobile Application Setup

### Navigate to Mobile Directory
```bash
cd mobile
```

### Install Dependencies
```bash
npm install
```

### Available Scripts
The mobile application provides several npm scripts for development:

**Key Scripts:**
- `npm start`: Start the Expo development server
- `npm run android`: Run on Android emulator
- `npm run ios`: Run on iOS simulator
- `npm run web`: Run on web browser
- `npm run reset-project`: Reset to fresh project state

```json
"scripts": {
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "reset-project": "node ./scripts/reset-project.js"
}
```

**Section sources**
- [package.json](file://mobile/package.json#L1-L50)
- [README.md](file://mobile/README.md#L1-L51)

## Environment Configuration

### Backend Environment Variables
Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/xclone
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
ARCJET_KEY=your_arcjet_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Required Environment Variables:**
- `MONGO_URI`: MongoDB connection string
- `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`: Authentication service keys
- `CLOUDINARY_*`: Image storage service credentials
- `ARCJET_KEY`: Security and rate limiting service key

**Section sources**
- [env.js](file://backend/src/config/env.js#L1-L16)
- [cloudinary.js](file://backend/src/config/cloudinary.js#L1-L10)

## Authentication Implementation

### Clerk SSO Integration
The mobile application now implements authentication using Clerk's Single Sign-On (SSO) flow. The authentication is integrated at the app shell level.

#### App Shell Configuration
The root layout in `_layout.tsx` wraps the application with `ClerkProvider`:

```tsx
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{title: "Home"}} />
      </Stack>
    </ClerkProvider>
  );
}
```

#### Authentication Screen
The authentication screen at `(auth)/index.tsx` provides social login options:

```tsx
export default function Index() {
  const { handleSocialAuth, isloading } = useSocialAuth();
  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 px-8 justify-between">
        <View className="flex-1 justify-center">
          <View className="items-center">
            <Image
              source={require("../../assets/images/auth1.png")}
              className="size-96"
              resizeMode="contain"
            />
          </View>
          <View className="flex-col gap-2 my-5">
            <TouchableOpacity
              onPress={() => handleSocialAuth("oauth_google")}
              disabled={isloading}
            >
              <View className="flex-row items-center justify-center">
                <Image
                  source={require("../../assets/images/google.png")}
                  className="size-10 mr-3"
                  resizeMode="contain"
                />
                <Text>continue with Google</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSocialAuth("oauth_apple")}
              disabled={isloading}
            >
              <View className="flex-row items-center justify-center">
                <Image
                  source={require("../../assets/images/apple.png")}
                  className="size-8 mr-3"
                  resizeMode="contain"
                />
                <Text>continue with Apple</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text className="text-center text-gray-500 text-xs leading-4 mt-6 px-2">
            By signing up, you agree to our{" "}
            <Text className="text-blue-500">Terms</Text>
            {", "}
            <Text className="text-blue-500">Privacy Policy</Text>
            {", and "}
            <Text className="text-blue-500">Cookie Use</Text>.
          </Text>
        </View>
      </View>
    </View>
  );
}
```

#### Social Authentication Hook
The `useSocialAuth` hook handles the SSO flow:

```tsx
export const useSocialAuth = () => {
  const [isloading, setIsLoading] = useState(false);
  const { startSSOFlow } = useSSO();

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    setIsLoading(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.log("Error in social auth", err);
      const provider = strategy === "oauth_google" ? "Google" : "Apple";
      Alert.alert(
        "Error",
        `Failed to sign in with ${provider}. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };
  return { isloading, handleSocialAuth };
};
```

**Section sources**
- [_layout.tsx](file://mobile/app/_layout.tsx#L1-L14) - *Updated in recent commit*
- [index.tsx](file://mobile/app/(auth)/index.tsx#L1-L102) - *Updated in recent commit*
- [useSocialAuth.ts](file://mobile/hooks/useSocialAuth.ts#L1-L29) - *Added in recent commit*

## Running the Applications

### Start Backend Server
```bash
cd backend
npm run dev
```
The backend server will run on port 5001 by default.

### Start Mobile Application
```bash
cd mobile
npm start
```

### Running Both Servers Concurrently
Use one of these methods to run both applications simultaneously:

**Method 1: Using concurrently package**
```bash
npm install -g concurrently
concurrently "cd backend && npm run dev" "cd mobile && npm start"
```

**Method 2: Using separate terminal windows**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Mobile
cd mobile
npm start
```

The mobile app can be accessed via:
- **Expo Go app** on physical device
- **Android emulator** 
- **iOS simulator**
- **Web browser** (via `npm run web`)

**Section sources**
- [server.js](file://backend/src/server.js#L1-L48)
- [app.json](file://mobile/app.json#L1-L43)

## Basic Usage Examples

### User Registration Flow
The application uses Clerk for authentication. User registration happens automatically when a user signs in for the first time:

```javascript
// This is handled by the syncUser controller
export const syncUser = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const existingUser = await User.findOne({ clerkId: userId });
  
  if (existingUser) {
    res.status(200).json({ message: "User already exists" });
  } else {
    // Create new user from Clerk data
    const clerkUser = await clerkClient.users.getUser(userId);
    const userData = {
      clerkId: userId,
      email: clerkUser.emailAddresses[0].emailAddress,
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
      username: clerkUser.emailAddresses[0].emailAddress.split("@")[0],
      profilePicture: clerkUser.imageUrl || "",
    };
    const user = await User.create(userData);
    res.status(201).json({ user, message: "User created successfully" });
  }
});
```

### Creating a Post
To create a post with text and/or image:

```javascript
export const createPosts = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { content } = req.body;
  const imageFile = req.file;
  
  if (!content && !imageFile) {
    return res.status(400).json({ message: "Please provide content or image" });
  }
  
  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ message: "User not found" });

  let imageUrl = "";
  
  // Upload image to Cloudinary if provided
  if (imageFile) {
    const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: "social_media_posts",
      resource_type: "image",
      transformation: [
        { width: 800, height: 600, crop: "limit" },
        { quality: "auto" },
        { format: "auto" }
      ]
    });
    imageUrl = uploadResponse.secure_url;
  }
  
  const post = await Post.create({
    user: user._id,
    content: content || "",
    image: imageUrl,
  });

  res.status(201).json({ post });
});
```

### Interacting with Posts
#### Liking a Post
```javascript
export const likePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { userId } = getAuth(req);
  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);
  
  if (!user || !post) return res.status(404).json({ message: "User or post Not found" });

  const isLiked = post.likes.includes(user._id);

  if (isLiked) {
    // Unlike
    await Post.findByIdAndUpdate(postId, { $pull: { likes: user._id } });
  } else {
    // Like
    await Post.findByIdAndUpdate(postId, { $push: { likes: user._id } });
    
    // Create notification if not liking own post
    if (post.user.toString() !== user._id.toString()) {
      await Notification.create({
        from: user._id,
        to: post.user,
        type: "like",
        post: postId
      });
    }
  }

  res.status(200).json({
    message: isLiked ? "Post unliked successfully" : "Post liked successfully"
  });
});
```

#### Adding a Comment
```javascript
export const createComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;
  const { content } = req.body;
  
  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Comment cannot be empty" });
  }
  
  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);
  
  if (!user || !post) return res.status(404).json({ message: "user or post not found" });

  const comment = await Comment.create({
    user: user._id,
    post: post._id,
    content,
  });

  // Link comment to post
  await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

  // Create notification if not commenting on own post
  if (post.user.toString() !== user._id.toString()) {
    await Notification.create({
      from: user._id,
      to: post.user,
      type: "comment",
      post: postId,
      comment: comment._id
    });
  }

  res.status(201).json({ comment });
});
```

**Section sources**
- [user.controller.js](file://backend/src/controllers/user.controller.js#L1-L97)
- [post.controller.js](file://backend/src/controllers/post.controller.js#L1-L159)
- [comment.controller.js](file://backend/src/controllers/comment.controller.js#L1-L84)
- [user.model.js](file://backend/src/models/user.model.js#L1-L64)
- [post.model.js](file://backend/src/models/post.model.js#L1-L37)
- [comment.model.js](file://backend/src/models/comment.model.js#L1-L32)

## Troubleshooting Guide

### Common Setup Issues

#### Port Conflicts
If port 5001 is already in use:
```bash
# Change the PORT in .env file
PORT=5002

# Or kill the process using port 5001
# Windows
netstat -ano | findstr :5001
taskkill /PID <process_id> /F

# macOS/Linux
lsof -i :5001
kill -9 <process_id>
```

#### Missing Dependencies
If you encounter missing module errors:
```bash
# Clear npm cache and reinstall
cd backend
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

cd ../mobile
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### MongoDB Connection Issues
Ensure MongoDB service is running and verify the connection string:
```env
# Check if MongoDB is accessible
MONGO_URI=mongodb://localhost:27017/xclone

# Test connection with MongoDB Compass or CLI
mongo "mongodb://localhost:27017/xclone"
```

#### Emulator Problems
For Android/iOS emulator issues:
```bash
# Android
npm run android
# Ensure Android Studio and emulator are properly configured

# iOS
npm run ios
# Requires Xcode and iOS simulator on macOS
```

#### Environment Variables Not Loading
Ensure the `.env` file is in the correct location (`backend/`) and restart the server after making changes.

#### Cloudinary Upload Errors
Verify Cloudinary credentials in `.env` file and check internet connection.

**Section sources**
- [env.js](file://backend/src/config/env.js#L1-L16)
- [db.js](file://backend/src/config/db.js#L1-L11)
- [cloudinary.js](file://backend/src/config/cloudinary.js#L1-L10)
- [server.js](file://backend/src/server.js#L1-L48)