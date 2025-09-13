# User API Endpoints

<cite>
**Referenced Files in This Document**   
- [user.route.js](file://backend/src/routes/user.route.js)
- [user.controller.js](file://backend/src/controllers/user.controller.js)
- [user.model.js](file://backend/src/models/user.model.js)
- [auth.middleware.js](file://backend/src/middleware/auth.middleware.js)
- [arcjet.middleware.js](file://backend/src/middleware/arcjet.middleware.js)
- [arcjet.js](file://backend/src/config/arcjet.js)
</cite>

## Table of Contents
1. [User API Endpoints Overview](#user-api-endpoints-overview)
2. [Authentication and Security](#authentication-and-security)
3. [Rate Limiting and Bot Protection](#rate-limiting-and-bot-protection)
4. [User Profile Retrieval](#user-profile-retrieval)
5. [User Profile Update](#user-profile-update)
6. [User Synchronization with Clerk](#user-synchronization-with-clerk)
7. [Follow/Unfollow User](#followunfollow-user)
8. [Request and Response Examples](#request-and-response-examples)
9. [Error Handling](#error-handling)
10. [Data Model](#data-model)

## User API Endpoints Overview

The xClone backend provides a set of RESTful API endpoints for managing user profiles and interactions. These endpoints are implemented in the `user.route.js` file and are backed by controller logic in `user.controller.js`. The user data is persisted in MongoDB using the schema defined in `user.model.js`.

Key endpoints include:
- `GET /api/users/profile/:username` – Retrieve a user's public profile by username
- `PUT /api/users/profile` – Update the authenticated user's profile
- `POST /api/users/sync` – Sync user data from Clerk authentication system
- `POST /api/users/me` – Get the currently authenticated user's profile
- `POST /api/users/follow/:targetUserId` – Follow or unfollow another user

These routes are protected by authentication and rate-limiting middleware to ensure security and performance.

**Section sources**
- [user.route.js](file://backend/src/routes/user.route.js#L1-L18)

## Authentication and Security

All user modification endpoints require authentication via Clerk JWT tokens. The `protectRoute` middleware from `auth.middleware.js` validates the presence and authenticity of the JWT token in the `Authorization` header.

If the token is missing or invalid, a `401 Unauthorized` response is returned.

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

Users can only update their own profiles. The system verifies ownership by comparing the authenticated `userId` (from Clerk) with the `clerkId` stored in the database.

**Section sources**
- [auth.middleware.js](file://backend/src/middleware/auth.middleware.js#L1-L9)

## Rate Limiting and Bot Protection

The `arcjetMiddleware` applies rate limiting and bot protection to user-related operations. It uses the Arcjet service configured in `arcjet.js` with the following rules:

- **Rate Limiting**: Token bucket algorithm with 10 tokens replenished every 10 seconds, up to a maximum of 15 tokens.
- **Bot Detection**: Blocks automated requests except for known search engines.
- **Shield Protection**: Defends against common attacks like SQL injection, XSS, and CSRF.

If a request is denied, appropriate HTTP status codes are returned:
- `429 Too Many Requests` for rate limit breaches
- `403 Forbidden` for bot or security policy violations

```mermaid
sequenceDiagram
participant Client
participant Middleware
participant Arcjet
Client->>Middleware : HTTP Request
Middleware->>Arcjet : Check Request
Arcjet-->>Middleware : Decision (Allow/Deny)
alt Request Allowed
Middleware->>Next : Proceed to Handler
else Request Denied
Middleware-->>Client : 429 or 403 Response
end
```

**Diagram sources**
- [arcjet.middleware.js](file://backend/src/middleware/arcjet.middleware.js#L1-L45)
- [arcjet.js](file://backend/src/config/arcjet.js#L1-L30)

## User Profile Retrieval

### GET /api/users/profile/:username

Retrieves a user's public profile by their username.

**Request**
- Method: `GET`
- URL: `/api/users/profile/{username}`
- Headers: None required for public access
- Path Parameters:
  - `username`: The username of the user to retrieve

**Response**
- `200 OK`: Returns user object
- `404 Not Found`: If user does not exist

```json
{
  "user": {
    "clerkId": "user_2aB3cD4eF5gH6iJ7kL8mN9oP",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "profilePicture": "https://example.com/images/profile.jpg",
    "bannerImage": "",
    "bio": "Software developer passionate about open source.",
    "location": "San Francisco, CA",
    "followers": [],
    "following": [],
    "createdAt": "2023-08-15T10:30:00.000Z",
    "updatedAt": "2023-08-15T10:30:00.000Z"
  }
}
```

**Section sources**
- [user.controller.js](file://backend/src/controllers/user.controller.js#L3-L12)

## User Profile Update

### PUT /api/users/profile

Updates the authenticated user's profile information.

**Request**
- Method: `PUT`
- URL: `/api/users/profile`
- Headers:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body: Partial user object with fields to update

**Validation Rules**
- `username`: Must be unique (enforced by MongoDB)
- `bio`: Maximum 160 characters
- All other fields validated by schema

**Response**
- `200 OK`: Returns updated user object
- `400 Bad Request`: If request body is malformed
- `401 Unauthorized`: If not authenticated
- `403 Forbidden`: If security rules are violated
- `404 Not Found`: If user does not exist

```json
{
  "user": {
    "clerkId": "user_2aB3cD4eF5gH6iJ7kL8mN9oP",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "john_doe_dev",
    "profilePicture": "https://example.com/images/new-profile.jpg",
    "bio": "Full-stack developer building the future.",
    "location": "New York, NY"
  }
}
```

```mermaid
sequenceDiagram
participant Client
participant Auth
participant Controller
participant DB
Client->>Auth : PUT /profile + JWT
Auth->>Controller : Verify Token
Controller->>DB : FindAndUpdate by clerkId
DB-->>Controller : Updated User
Controller-->>Client : 200 + User
```

**Section sources**
- [user.controller.js](file://backend/src/controllers/user.controller.js#L14-L23)
- [user.model.js](file://backend/src/models/user.model.js#L1-L63)

## User Synchronization with Clerk

### POST /api/users/sync

Synchronizes user data from the Clerk authentication system to the local MongoDB database.

**Request**
- Method: `POST`
- URL: `/api/users/sync`
- Headers:
  - `Authorization: Bearer <token>`
- Body: None

**Process**
1. Extract `userId` from Clerk JWT
2. Check if user already exists in MongoDB
3. If not, fetch user data from Clerk API
4. Create new user with derived fields (e.g., username from email)

**Response**
- `200 OK`: If user already exists
- `201 Created`: If new user was created
- `401 Unauthorized`: If not authenticated

```json
{
  "user": {
    "clerkId": "user_2aB3cD4eF5gH6iJ7kL8mN9oP",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "profilePicture": "https://clerk.com/images/profile.jpg"
  },
  "message": "User created successfully"
}
```

**Section sources**
- [user.controller.js](file://backend/src/controllers/user.controller.js#L25-L44)

## Follow/Unfollow User

### POST /api/users/follow/:targetUserId

Toggles follow/unfollow state between the authenticated user and the target user.

**Request**
- Method: `POST`
- URL: `/api/users/follow/{targetUserId}`
- Headers:
  - `Authorization: Bearer <token>`
- Path Parameters:
  - `targetUserId`: The ID of the user to follow/unfollow

**Rules**
- Users cannot follow themselves (`400 Bad Request`)
- Creates a follow notification when following
- Updates both users' `followers` and `following` arrays

**Response**
- `200 OK`: Operation successful
- `400 Bad Request`: If trying to follow self
- `404 Not Found`: If either user does not exist

```json
{
  "message": "User followed successfully"
}
```

```mermaid
flowchart TD
A[Start] --> B{Same User?}
B --> |Yes| C[400 Error]
B --> |No| D{Already Following?}
D --> |Yes| E[Remove from Following]
D --> |No| F[Add to Following]
E --> G[Update Both Users]
F --> G
G --> H[Create Notification if Following]
H --> I[Return Success]
```

**Section sources**
- [user.controller.js](file://backend/src/controllers/user.controller.js#L46-L95)

## Request and Response Examples

### Sample cURL Requests

**Get User Profile**
```bash
curl -X GET "http://localhost:5000/api/users/profile/johndoe"
```

**Update Profile**
```bash
curl -X PUT "http://localhost:5000/api/users/profile" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Building scalable web applications",
    "location": "Austin, TX"
  }'
```

**Follow User**
```bash
curl -X POST "http://localhost:5000/api/users/follow/user_9xY8zA7bC6dE5fG4hI3jK2lM" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

## Error Handling

The API returns standardized error responses:

| Status Code | Error Type | Message Example |
|-------------|------------|----------------|
| 400 | Bad Request | `"You cannot follow yourself"` |
| 401 | Unauthorized | `"Unauthorized-you must be logged in"` |
| 403 | Forbidden | `"Access denied by security policy."` |
| 404 | Not Found | `"User not found"` |
| 429 | Too Many Requests | `"Rate limit exceeded. Please try again later."` |

All errors are returned in JSON format with an `error` or `message` field.

**Section sources**
- [user.controller.js](file://backend/src/controllers/user.controller.js#L10-L11)
- [auth.middleware.js](file://backend/src/middleware/auth.middleware.js#L4-L6)
- [arcjet.middleware.js](file://backend/src/middleware/arcjet.middleware.js#L10-L35)

## Data Model

The User model in MongoDB contains the following fields:

```mermaid
erDiagram
USER {
string clerkId PK
string email UK
string username UK
string firstName
string lastName
string profilePicture
string bannerImage
string bio
string location
array followers FK
array following FK
timestamp createdAt
timestamp updatedAt
}
```

**Field Details**
- `clerkId`: Unique identifier from Clerk (required, unique)
- `email`: User's email address (required, unique)
- `username`: Unique username (required, unique)
- `bio`: Maximum 160 characters
- `followers`, `following`: Arrays of User ObjectIds
- `timestamps`: Automatically managed `createdAt` and `updatedAt`

**Section sources**
- [user.model.js](file://backend/src/models/user.model.js#L1-L63)