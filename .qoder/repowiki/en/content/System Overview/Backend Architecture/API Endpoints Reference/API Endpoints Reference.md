# API Endpoints Reference

<cite>
**Referenced Files in This Document**   
- [user.route.js](file://backend/src/routes/user.route.js#L1-L18)
- [post.route.js](file://backend/src/routes/post.route.js#L1-L21)
- [comment.route.js](file://backend/src/routes/comment.route.js#L1-L15)
- [notification.route.js](file://backend/src/routes/notification.route.js#L1-L10)
- [user.controller.js](file://backend/src/controllers/user.controller.js#L1-L96)
- [post.controller.js](file://backend/src/controllers/post.controller.js)
- [comment.controller.js](file://backend/src/controllers/comment.controller.js)
- [notification.controller.js](file://backend/src/controllers/notification.controller.js)
- [auth.middleware.js](file://backend/src/middleware/auth.middleware.js#L1-L8)
- [arcjet.middleware.js](file://backend/src/middleware/arcjet.middleware.js#L1-L45)
- [upload.middleware.js](file://backend/src/middleware/upload.middleware.js)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Authentication and Security](#authentication-and-security)
3. [User Endpoints](#user-endpoints)
4. [Post Endpoints](#post-endpoints)
5. [Comment Endpoints](#comment-endpoints)
6. [Notification Endpoints](#notification-endpoints)
7. [Rate Limiting and Bot Protection](#rate-limiting-and-bot-protection)
8. [Error Handling](#error-handling)
9. [Request and Response Examples](#request-and-response-examples)
10. [Sample cURL Commands](#sample-curl-commands)

## Introduction
This document provides a comprehensive reference for the RESTful API endpoints in the xClone backend. It details all public and protected routes for user, post, comment, and notification resources. Each endpoint includes HTTP method, URL pattern, parameters, request/response schemas, authentication requirements, and example payloads. The backend uses Express.js with Clerk for authentication and Arcjet for security enforcement.

**Section sources**
- [user.route.js](file://backend/src/routes/user.route.js#L1-L18)
- [post.route.js](file://backend/src/routes/post.route.js#L1-L21)
- [comment.route.js](file://backend/src/routes/comment.route.js#L1-L15)
- [notification.route.js](file://backend/src/routes/notification.route.js#L1-L10)

## Authentication and Security

### Clerk JWT Authentication
All protected routes require authentication via Clerk using JWT tokens. The `protectRoute` middleware validates session tokens from Clerk.

```javascript
export const protectRoute = async (req, res, next) => {
  if (!req.auth().isAuthenticated) {
    return res.status(401).json({
      message: "Unauthorized-you must be logged in",
    });
  }
  next();
};
```

The middleware is imported in route files and applied to protected endpoints. Authentication state is determined by `req.auth().isAuthenticated`.

### Required Headers
Protected endpoints require:
- `Authorization` header with valid Bearer token (managed by Clerk)
- `Content-Type: application/json` for JSON payloads
- Form-data encoding for file uploads

**Section sources**
- [auth.middleware.js](file://backend/src/middleware/auth.middleware.js#L1-L8)

## User Endpoints

### Get User Profile
Retrieves public profile information by username.

**Endpoint**  
`GET /api/users/profile/:username`

**Parameters**
- `:username` (path): Username of the target user

**Authentication**  
No (Public route)

**Response (200)**
```json
{
  "user": {
    "clerkId": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "username": "string",
    "profilePicture": "string",
    "followers": ["string"],
    "following": ["string"],
    "createdAt": "datetime"
  }
}
```

**Error Responses**
- `404`: User not found

**Section sources**
- [user.route.js](file://backend/src/routes/user.route.js#L7)
- [user.controller.js](file://backend/src/controllers/user.controller.js#L5-L12)

### Sync User
Creates a new user in MongoDB from Clerk user data if not already present.

**Endpoint**  
`POST /api/users/sync`

**Authentication**  
Yes (Requires valid Clerk session)

**Response (201)**
```json
{
  "user": { /* user object */ },
  "message": "User created successfully"
}
```

**Response (200)**
```json
{
  "message": "User already exists"
}
```

**Section sources**
- [user.route.js](file://backend/src/routes/user.route.js#L10)
- [user.controller.js](file://backend/src/controllers/user.controller.js#L45-L68)

### Get Current User
Retrieves the authenticated user's full profile.

**Endpoint**  
`POST /api/users/me`

**Authentication**  
Yes

**Response (200)**
```json
{
  "user": { /* current user object */ }
}
```

**Error Responses**
- `404`: User not found in database

**Section sources**
- [user.route.js](file://backend/src/routes/user.route.js#L11)
- [user.controller.js](file://backend/src/controllers/user.controller.js#L70-L77)

### Update Profile
Updates the authenticated user's profile information.

**Endpoint**  
`PUT /api/users/profile`

**Authentication**  
Yes

**Request Body**
```json
{
  "firstName": "string",
  "lastName": "string",
  "bio": "string",
  "website": "string"
}
```

**Response (200)**
```json
{
  "user": { /* updated user object */ }
}
```

**Error Responses**
- `404`: User not found

**Section sources**
- [user.route.js](file://backend/src/routes/user.route.js#L9)
- [user.controller.js](file://backend/src/controllers/user.controller.js#L14-L22)

### Follow User
Toggles follow/unfollow state for a target user.

**Endpoint**  
`POST /api/users/follow/:targetUserId`

**Parameters**
- `:targetUserId` (path): MongoDB ID of the user to follow/unfollow

**Authentication**  
Yes

**Validation Rules**
- Cannot follow self (`400` error)
- Both users must exist (`404` error if not found)

**Response (200)**
```json
{
  "message": "User followed successfully" 
  // or "User unfollowed successfully"
}
```

**Side Effects**
- Creates a notification when following
- Updates `following` array in current user
- Updates `followers` array in target user

**Section sources**
- [user.route.js](file://backend/src/routes/user.route.js#L12)
- [user.controller.js](file://backend/src/controllers/user.controller.js#L79-L96)

## Post Endpoints

### Get All Posts
Retrieves all posts for the feed (paginated).

**Endpoint**  
`GET /api/posts`

**Authentication**  
No (Public)

**Query Parameters**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Posts per page (default: 10)

**Response (200)**
```json
[
  {
    "id": "string",
    "content": "string",
    "image": "string (URL)",
    "author": { "username": "string", "profilePicture": "string" },
    "likes": ["userId"],
    "commentCount": 0,
    "createdAt": "datetime"
  }
]
```

**Section sources**
- [post.route.js](file://backend/src/routes/post.route.js#L10)

### Get Post by ID
Retrieves a single post with comments.

**Endpoint**  
`GET /api/posts/:postId`

**Authentication**  
No

**Response (200)**
```json
{
  "post": { /* post object with comments populated */ }
}
```

**Error Responses**
- `404`: Post not found

**Section sources**
- [post.route.js](file://backend/src/routes/post.route.js#L11)

### Get User Posts
Retrieves all posts by a specific user.

**Endpoint**  
`GET /api/posts/user/:username`

**Authentication**  
No

**Response (200)**
```json
[
  { /* array of post objects */ }
]
```

**Section sources**
- [post.route.js](file://backend/src/routes/post.route.js#L12)

### Create Post
Creates a new post with optional image.

**Endpoint**  
`POST /api/posts`

**Authentication**  
Yes

**Request Body (form-data)**
- `content` (text): Post content (max 500 characters)
- `image` (file, optional): Image file (JPG/PNG, max 5MB)

**Headers**
- `Content-Type: multipart/form-data`

**Response (201)**
```json
{
  "post": { /* created post object */ }
}
```

**Validation**
- Content required, 1-500 characters
- Image must be valid format and size
- Uses Cloudinary via upload middleware

**Section sources**
- [post.route.js](file://backend/src/routes/post.route.js#L15)
- [upload.middleware.js](file://backend/src/middleware/upload.middleware.js)

### Like Post
Toggles like/unlike state for a post.

**Endpoint**  
`POST /api/posts/:postId/like`

**Authentication**  
Yes

**Response (200)**
```json
{
  "message": "Post liked",
  "likesCount": 5
}
```

**Implementation**
- Adds/removes user ID from post's `likes` array
- Returns updated like count

**Section sources**
- [post.route.js](file://backend/src/routes/post.route.js#L17)

### Delete Post
Deletes a post (must be owner).

**Endpoint**  
`DELETE /api/posts/:postId`

**Authentication**  
Yes

**Authorization**
- Only the post author can delete

**Response (200)**
```json
{
  "message": "Post deleted successfully"
}
```

**Error Responses**
- `403`: Not authorized
- `404`: Post not found

**Section sources**
- [post.route.js](file://backend/src/routes/post.route.js#L18)

## Comment Endpoints

### Get Comments for Post
Retrieves all comments for a post.

**Endpoint**  
`GET /api/comments/post/:postId`

**Authentication**  
No

**Response (200)**
```json
[
  {
    "id": "string",
    "content": "string",
    "author": { "username": "string", "profilePicture": "string" },
    "createdAt": "datetime"
  }
]
```

**Section sources**
- [comment.route.js](file://backend/src/routes/comment.route.js#L9)

### Create Comment
Adds a comment to a post.

**Endpoint**  
`POST /api/comments/post/:postId`

**Authentication**  
Yes

**Request Body**
```json
{
  "content": "string (1-300 characters)"
}
```

**Response (201)**
```json
{
  "comment": { /* created comment object */ }
}
```

**Validation**
- Content required, 1-300 characters
- Post must exist

**Section sources**
- [comment.route.js](file://backend/src/routes/comment.route.js#L12)
- [comment.controller.js](file://backend/src/controllers/comment.controller.js)

### Delete Comment
Deletes a comment (must be owner).

**Endpoint**  
`DELETE /api/comments/:commentId`

**Authentication**  
Yes

**Authorization**
- Only comment author can delete

**Response (200)**
```json
{
  "message": "Comment deleted successfully"
}
```

**Section sources**
- [comment.route.js](file://backend/src/routes/comment.route.js#L14)
- [comment.controller.js](file://backend/src/controllers/comment.controller.js)

## Notification Endpoints

### Get Notifications
Retrieves all notifications for the authenticated user.

**Endpoint**  
`GET /api/notifications`

**Authentication**  
Yes

**Response (200)**
```json
[
  {
    "id": "string",
    "from": { "username": "string", "profilePicture": "string" },
    "type": "follow|like|comment",
    "read": false,
    "createdAt": "datetime"
  }
]
```

**Pagination**
- Supports `limit` and `page` query parameters

**Section sources**
- [notification.route.js](file://backend/src/routes/notification.route.js#L7)
- [notification.controller.js](file://backend/src/controllers/notification.controller.js)

### Delete Notification
Removes a notification (mark as read or delete).

**Endpoint**  
`DELETE /api/notifications/:notificationId`

**Authentication**  
Yes

**Authorization**
- Only notification recipient can delete

**Response (200)**
```json
{
  "message": "Notification deleted"
}
```

**Section sources**
- [notification.route.js](file://backend/src/routes/notification.route.js#L8)
- [notification.controller.js](file://backend/src/controllers/notification.controller.js)

## Rate Limiting and Bot Protection

### Arcjet Middleware
The backend uses Arcjet for rate limiting, bot detection, and security.

```javascript
export const arcjetMiddleware = async (req, res, next) => {
  const decision = await aj.protect(req, {
    requested: 1,
  });
  // ... decision handling
};
```

**Applied To**: All API routes (globally configured)

**Rate Limiting Rules**
- Default: 100 requests per hour per user
- Burst: 10 requests per minute
- Identified by user session or IP fallback

**Bot Protection**
- Blocks known malicious bots
- Detects and blocks spoofed bot activity
- Challenges automated requests

**Error Responses**
- `429 Too Many Requests`: Rate limit exceeded
- `403 Forbidden`: Bot or malicious activity detected

**Section sources**
- [arcjet.middleware.js](file://backend/src/middleware/arcjet.middleware.js#L1-L45)

## Error Handling

### Standard Error Structure
All errors follow consistent JSON format:

```json
{
  "error": "Error Type",
  "message": "Human-readable description"
}
```

### Status Codes
- `200`: Success
- `201`: Resource created
- `400`: Bad request (validation)
- `401`: Unauthorized (missing auth)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `429`: Rate limited
- `500`: Internal server error

### Validation Rules
**User Profile**
- Username: 3-30 characters, alphanumeric + underscore
- Email: Valid format (from Clerk)
- Name fields: Max 50 characters

**Posts**
- Content: 1-500 characters
- Image: JPG/PNG, max 5MB, uploaded via Cloudinary

**Comments**
- Content: 1-300 characters

**Section sources**
- [user.controller.js](file://backend/src/controllers/user.controller.js)
- [post.controller.js](file://backend/src/controllers/post.controller.js)
- [comment.controller.js](file://backend/src/controllers/comment.controller.js)

## Request and Response Examples

### Successful User Profile Response
```json
{
  "user": {
    "clerkId": "user_123abc",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "profilePicture": "https://example.com/avatar.jpg",
    "followers": ["user_456def"],
    "following": ["user_789ghi"],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Create Post Request (form-data)
```
content: "Hello world!"
image: [file upload]
```

### Like Post Response
```json
{
  "message": "Post liked",
  "likesCount": 7
}
```

### Rate Limit Error
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later."
}
```

## Sample cURL Commands

### Create a Post
```bash
curl -X POST https://xclone-api.com/api/posts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: multipart/form-data" \
  -F "content=Just had an amazing coffee!" \
  -F "image=@/path/to/coffee.jpg"
```

### Like a Post
```bash
curl -X POST https://xclone-api.com/api/posts/post_123abc/like \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### Fetch Notifications
```bash
curl -X GET https://xclone-api.com/api/notifications \
  -H "Authorization: Bearer <token>" \
  -G \
  --data-urlencode "limit=20" \
  --data-urlencode "page=1"
```

### Follow a User
```bash
curl -X POST https://xclone-api.com/api/users/follow/user_456def \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### Get User Feed
```bash
curl -X GET https://xclone-api.com/api/posts \
  -G \
  --data-urlencode "page=1" \
  --data-urlencode "limit=10"
```