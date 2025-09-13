# API Endpoints Reference

<cite>
**Referenced Files in This Document**   
- [user.route.js](file://backend/src/routes/user.route.js)
- [post.route.js](file://backend/src/routes/post.route.js)
- [comment.route.js](file://backend/src/routes/comment.route.js)
- [notification.route.js](file://backend/src/routes/notification.route.js)
- [user.controller.js](file://backend/src/controllers/user.controller.js)
- [post.controller.js](file://backend/src/controllers/post.controller.js)
- [comment.controller.js](file://backend/src/controllers/comment.controller.js)
- [notification.controller.js](file://backend/src/controllers/notification.controller.js)
- [auth.middleware.js](file://backend/src/middleware/auth.middleware.js)
- [upload.middleware.js](file://backend/src/middleware/upload.middleware.js)
</cite>

## Table of Contents
1. [User Endpoints](#user-endpoints)
2. [Post Endpoints](#post-endpoints)
3. [Comment Endpoints](#comment-endpoints)
4. [Notification Endpoints](#notification-endpoints)
5. [Authentication and Headers](#authentication-and-headers)
6. [Error Handling](#error-handling)
7. [Data Validation and Constraints](#data-validation-and-constraints)
8. [Rate Limiting](#rate-limiting)

## User Endpoints

Provides functionality for user profile retrieval, updates, synchronization with Clerk, and follow/unfollow actions.

### GET /api/users/profile/:username
Retrieves public profile information of a user by username.

**Request Parameters**
- Path: `username` (string, required)

**Authentication**: Not required

**Response Schema (200 OK)**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "firstName": "string",
    "lastName": "string",
    "profilePicture": "string",
    "followers": ["string"],
    "following": ["string"],
    "createdAt": "datetime"
  }
}
```

**Error Responses**
- 404: `{ "message": "User not found" }`

**Section sources**
- [user.route.js](file://backend/src/routes/user.route.js#L7)
- [user.controller.js](file://backend/src/controllers/user.controller.js#L5-L12)

### POST /api/users/sync
Synchronizes the current authenticated user from Clerk into the application database if not already present.

**Authentication**: Required (Clerk JWT)

**Required Headers**
- `Authorization`: Bearer {token}
- `Content-Type`: application/json

**Response Schema (201 Created)**
```json
{
  "user": { /* user object */ },
  "message": "User created successfully"
}
```

**Response Schema (200 OK - already exists)**
```json
{
  "message": "User already exists"
}
```

**Section sources**
- [user.route.js](file://backend/src/routes/user.route.js#L9)
- [user.controller.js](file://backend/src/controllers/user.controller.js#L34-L52)

### POST /api/users/me
Retrieves the full profile of the currently authenticated user.

**Authentication**: Required (Clerk JWT)

**Required Headers**
- `Authorization`: Bearer {token}

**Response Schema (200 OK)**
```json
{
  "user": { /* user object with all fields */ }
}
```

**Error Responses**
- 404: `{ "message": "User not found" }`

**Section sources**
- [user.route.js](file://backend/src/routes/user.route.js#L10)
- [user.controller.js](file://backend/src/controllers/user.controller.js#L54-L61)

### PUT /api/users/profile
Updates the profile of the currently authenticated user.

**Authentication**: Required (Clerk JWT)

**Request Body**
- Partial `User` object (e.g., `firstName`, `lastName`, `bio`)

**Required Headers**
- `Authorization`: Bearer {token}
- `Content-Type`: application/json

**Response Schema (200 OK)**
```json
{
  "user": { /* updated user object */ }
}
```

**Error Responses**
- 404: `{ "message": "User not found" }`

**Section sources**
- [user.route.js](file://backend/src/routes/user.route.js#L11)
- [user.controller.js](file://backend/src/controllers/user.controller.js#L20-L28)

### POST /api/users/follow/:targetUserId
Follows or unfollows a user by their database ID.

**Authentication**: Required (Clerk JWT)

**Request Parameters**
- Path: `targetUserId` (string, required)

**Required Headers**
- `Authorization`: Bearer {token}

**Behavior**
- If already following, unfollows the user
- Creates a notification when following

**Response Schema (200 OK)**
```json
{
  "message": "User followed successfully" | "User unfollowed successfully"
}
```

**Error Responses**
- 400: `{ "error": "You cannot follow yourself" }`
- 404: `{ "error": "User not found" }`

**Section sources**
- [user.route.js](file://backend/src/routes/user.route.js#L12)
- [user.controller.js](file://backend/src/controllers/user.controller.js#L63-L96)

## Post Endpoints

Manages creation, retrieval, liking, and deletion of posts.

### GET /api/posts
Retrieves all posts sorted by creation date (newest first).

**Authentication**: Not required

**Response Schema (200 OK)**
```json
{
  "posts": [
    {
      "id": "string",
      "content": "string",
      "image": "string",
      "user": {
        "username": "string",
        "firstName": "string",
        "lastName": "string",
        "profilePicture": "string"
      },
      "likes": ["string"],
      "comments": [
        {
          "id": "string",
          "content": "string",
          "user": {
            "username": "string",
            "firstName": "string",
            "lastName": "string",
            "profilePicture": "string"
          }
        }
      ],
      "createdAt": "datetime"
    }
  ]
}
```

**Section sources**
- [post.route.js](file://backend/src/routes/post.route.js#L10)
- [post.controller.js](file://backend/src/controllers/post.controller.js#L5-L14)

### GET /api/posts/:postId
Retrieves a specific post by ID.

**Request Parameters**
- Path: `postId` (string, required)

**Authentication**: Not required

**Response Schema (200 OK)**
```json
{
  "post": { /* single post object with populated user and comments */ }
}
```

**Error Responses**
- 404: `{ "message": "Post not found" }`

**Section sources**
- [post.route.js](file://backend/src/routes/post.route.js#L11)
- [post.controller.js](file://backend/src/controllers/post.controller.js#L16-L26)

### GET /api/posts/user/:username
Retrieves all posts by a specific user.

**Request Parameters**
- Path: `username` (string, required)

**Authentication**: Not required

**Response Schema (200 OK)**
```json
{
  "posts": [ /* array of posts by user */ ]
}
```

**Error Responses**
- 404: `{ "message": "User not found" }`

**Section sources**
- [post.route.js](file://backend/src/routes/post.route.js#L12)
- [post.controller.js](file://backend/src/controllers/post.controller.js#L28-L44)

### POST /api/posts
Creates a new post with optional text and image.

**Authentication**: Required (Clerk JWT)

**Request Body**
- `content` (string, optional)
- `image` (file, optional) - must be provided if content is empty

**Required Headers**
- `Authorization`: Bearer {token}
- `Content-Type`: multipart/form-data

**File Upload**
- Uses Cloudinary via `upload.middleware.js`
- Transforms image to max 800x600, auto quality and format

**Response Schema (201 Created)**
```json
{
  "post": { /* created post object */ }
}
```

**Error Responses**
- 400: `{ "message": "Please provide content or image" }` or `{ "error": "Failed to upload image" }`
- 404: `{ "message": "User not found" }`

**Section sources**
- [post.route.js](file://backend/src/routes/post.route.js#L15)
- [post.controller.js](file://backend/src/controllers/post.controller.js#L46-L98)
- [upload.middleware.js](file://backend/src/middleware/upload.middleware.js)

### POST /api/posts/:postId/like
Toggles like status on a post.

**Authentication**: Required (Clerk JWT)

**Request Parameters**
- Path: `postId` (string, required)

**Required Headers**
- `Authorization`: Bearer {token}

**Behavior**
- If already liked, removes like
- Creates notification if liking someone else's post

**Response Schema (200 OK)**
```json
{
  "message": "Post liked successfully" | "Post unliked successfully"
}
```

**Error Responses**
- 404: `{ "message": "User or post Not found" }`

**Section sources**
- [post.route.js](file://backend/src/routes/post.route.js#L17)
- [post.controller.js](file://backend/src/controllers/post.controller.js#L100-L130)

### DELETE /api/posts/:postId
Deletes a post (must be owner).

**Authentication**: Required (Clerk JWT)

**Request Parameters**
- Path: `postId` (string, required)

**Required Headers**
- `Authorization`: Bearer {token}

**Behavior**
- Also deletes all comments associated with the post

**Response Schema (200 OK)**
```json
{
  "message": "Post deleted successfully"
}
```

**Error Responses**
- 404: `{ "error": "User or post not found" }`
- 403: `{ "error": "You can only delete your own posts" }`

**Section sources**
- [post.route.js](file://backend/src/routes/post.route.js#L18)
- [post.controller.js](file://backend/src/controllers/post.controller.js#L132-L158)

## Comment Endpoints

Handles comment creation, retrieval, and deletion on posts.

### GET /api/comments/post/:postId
Retrieves all comments for a specific post.

**Request Parameters**
- Path: `postId` (string, required)

**Authentication**: Not required

**Response Schema (200 OK)**
```json
{
  "comment": [
    {
      "id": "string",
      "content": "string",
      "user": {
        "username": "string",
        "firstName": "string",
        "lastName": "string",
        "profilePicture": "string"
      },
      "createdAt": "datetime"
    }
  ]
}
```

**Error Responses**
- 404: `{ "message": "there is no comment" }`

**Section sources**
- [comment.route.js](file://backend/src/routes/comment.route.js#L8)
- [comment.controller.js](file://backend/src/controllers/comment.controller.js#L5-L13)

### POST /api/comments/post/:postId
Creates a new comment on a post.

**Authentication**: Required (Clerk JWT)

**Request Parameters**
- Path: `postId` (string, required)

**Request Body**
- `content` (string, required, non-empty)

**Required Headers**
- `Authorization`: Bearer {token}
- `Content-Type`: application/json

**Behavior**
- Links comment to post
- Creates notification if commenting on someone else's post

**Response Schema (201 Created)**
```json
{
  "comment": { /* created comment object */ }
}
```

**Error Responses**
- 400: `{ "error": "Comment cannot be empty" }`
- 404: `{ "message": "user or post not found" }`

**Section sources**
- [comment.route.js](file://backend/src/routes/comment.route.js#L11)
- [comment.controller.js](file://backend/src/controllers/comment.controller.js#L15-L47)

### DELETE /api/comments/:commentId
Deletes a comment (must be owner).

**Authentication**: Required (Clerk JWT)

**Request Parameters**
- Path: `commentId` (string, required)

**Required Headers**
- `Authorization`: Bearer {token}

**Behavior**
- Removes comment reference from parent post
- Deletes comment document

**Response Schema (200 OK)**
```json
{
  "message": "Comment deleted successfully"
}
```

**Error Responses**
- 404: `{ "error": "User or comment not found" }`
- 403: `{ "error": "You can only delete your own comments" }`

**Section sources**
- [comment.route.js](file://backend/src/routes/comment.route.js#L12)
- [comment.controller.js](file://backend/src/controllers/comment.controller.js#L49-L83)

## Notification Endpoints

Manages user notifications for follows, likes, and comments.

### GET /api/notifications
Retrieves all notifications for the authenticated user.

**Authentication**: Required (Clerk JWT)

**Required Headers**
- `Authorization`: Bearer {token}

**Response Schema (200 OK)**
```json
{
  "notifications": [
    {
      "id": "string",
      "from": {
        "username": "string",
        "firstName": "string",
        "lastName": "string",
        "profilePicture": "string"
      },
      "type": "follow" | "like" | "comment",
      "post": {
        "content": "string",
        "image": "string"
      },
      "comment": {
        "content": "string"
      },
      "read": "boolean",
      "createdAt": "datetime"
    }
  ]
}
```

**Error Responses**
- 404: `{ "error": "User not found" }`

**Section sources**
- [notification.route.js](file://backend/src/routes/notification.route.js#L6)
- [notification.controller.js](file://backend/src/controllers/notification.controller.js#L5-L20)

### DELETE /api/notifications/:notificationId
Deletes a specific notification (must belong to user).

**Authentication**: Required (Clerk JWT)

**Request Parameters**
- Path: `notificationId` (string, required)

**Required Headers**
- `Authorization`: Bearer {token}

**Response Schema (200 OK)**
```json
{
  "message": "Notification deleted successfully"
}
```

**Error Responses**
- 404: `{ "error": "User or notification not found" }`

**Section sources**
- [notification.route.js](file://backend/src/routes/notification.route.js#L7)
- [notification.controller.js](file://backend/src/controllers/notification.controller.js#L22-L36)

## Authentication and Headers

All protected routes require Clerk authentication via JWT token.

**Required Headers for Protected Routes**
- `Authorization`: Bearer {Clerk JWT token}
- `Content-Type`: application/json (for JSON bodies) or multipart/form-data (for file uploads)

**Authentication Middleware**
- `protectRoute` from `auth.middleware.js` verifies Clerk session
- Extracts `userId` from authenticated request

**Section sources**
- [auth.middleware.js](file://backend/src/middleware/auth.middleware.js)

## Error Handling

Standardized error responses across all endpoints.

**Common Status Codes**
- 200: Success (GET, DELETE)
- 201: Resource created (POST)
- 400: Bad request (validation, missing fields)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not found (resource does not exist)
- 500: Internal server error

**Error Response Structure**
```json
{
  "message" | "error": "string description"
}
```

**Section sources**
- [user.controller.js](file://backend/src/controllers/user.controller.js)
- [post.controller.js](file://backend/src/controllers/post.controller.js)
- [comment.controller.js](file://backend/src/controllers/comment.controller.js)
- [notification.controller.js](file://backend/src/controllers/notification.controller.js)

## Data Validation and Constraints

**Post Content**
- Must provide either `content` or `image` (or both)
- No explicit length limit

**Image Upload**
- Format: Any common image format (auto-converted)
- Size: Resized to max 800x600 pixels
- Stored on Cloudinary

**Comment Content**
- Must not be empty or whitespace-only

**Field Constraints**
- All text fields trimmed and sanitized
- Image URLs are validated by Cloudinary

**Section sources**
- [post.controller.js](file://backend/src/controllers/post.controller.js#L50-L55)
- [comment.controller.js](file://backend/src/controllers/comment.controller.js#L17-L19)
- [upload.middleware.js](file://backend/src/middleware/upload.middleware.js)

## Rate Limiting

**Arcjet Integration**
- Rate limiting enforced by Arcjet middleware
- Configured in `arcjet.middleware.js` and `arcjet.js`
- Protects against abuse of public endpoints
- Specific limits not defined in available code

**Section sources**
- [arcjet.middleware.js](file://backend/src/middleware/arcjet.middleware.js)
- [arcjet.js](file://backend/src/config/arcjet.js)