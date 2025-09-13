# Data Flow Between Layers

<cite>
**Referenced Files in This Document**   
- [post.route.js](file://backend/src/routes/post.route.js#L1-L21)
- [post.controller.js](file://backend/src/controllers/post.controller.js#L1-L159)
- [upload.middleware.js](file://backend/src/middleware/upload.middleware.js#L1-L22)
- [cloudinary.js](file://backend/src/config/cloudinary.js#L1-L11)
- [auth.middleware.js](file://backend/src/middleware/auth.middleware.js#L1-L9)
- [post.model.js](file://backend/src/models/post.model.js#L1-L37)
- [notification.controller.js](file://backend/src/controllers/notification.controller.js#L1-L37)
- [notification.model.js](file://backend/src/models/notification.model.js#L1-L37)
- [server.js](file://backend/src/server.js#L1-L48)
- [db.js](file://backend/src/config/db.js#L1-L12)
- [env.js](file://backend/src/config/env.js#L1-L16)
- [user.controller.js](file://backend/src/controllers/user.controller.js#L1-L97) - *Updated in recent commit*
- [user.route.js](file://backend/src/routes/user.route.js#L1-L19) - *Updated in recent commit*
- [useUserSync.ts](file://mobile/hooks/useUserSync.ts#L1-L26) - *Added in recent commit*
- [user.model.js](file://backend/src/models/user.model.js#L1-L64) - *Updated in recent commit*
- [api.ts](file://mobile/utils/api.ts#L1-L74) - *Updated in recent commit*
- [useCreatePost.ts](file://mobile/hooks/useCreatePost.ts#L1-L104) - *Added in recent commit*
- [PostComposer.tsx](file://mobile/components/PostComposer.tsx#L1-L98) - *Added in recent commit*
</cite>

## Update Summary
**Changes Made**   
- Added new section: "Post Creation UI Flow" to document the new post composer functionality
- Updated "Post Creation Data Flow" with detailed frontend implementation
- Enhanced "Project Structure" with new UI components and hooks
- Updated sequence diagram for post creation to include frontend interactions
- Added section sources for newly added files in post creation flow
- Updated referenced files list to include new components and hooks

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Authentication Data Flow](#authentication-data-flow)
4. [User Synchronization Flow](#user-synchronization-flow)
5. [Post Creation UI Flow](#post-creation-ui-flow)
6. [Post Creation Data Flow](#post-creation-data-flow)
7. [Image Upload Pipeline](#image-upload-pipeline)
8. [Notification Generation and Propagation](#notification-generation-and-propagation)
9. [API Request-Response Cycle](#api-request-response-cycle)
10. [Data Transformation and Validation](#data-transformation-and-validation)
11. [Security and Error Handling](#security-and-error-handling)
12. [Performance Considerations](#performance-considerations)

## Introduction
This document provides a comprehensive analysis of the data flow between the frontend (mobile app) and backend layers in the xClone application. It traces key operations including user authentication, user synchronization, post creation with text and image data, and notification generation from social interactions. The analysis covers the complete journey of data across components, including request-response cycles, data transformation, validation, security checks, and error recovery mechanisms. The system leverages Clerk for authentication, Cloudinary for image storage, and MongoDB for persistent data storage.

## Project Structure
The xClone project follows a modular architecture with separate `backend` and `mobile` directories. The backend is built using Node.js with Express, while the mobile frontend uses React Native. The backend organizes code by concerns: configuration, controllers, middleware, models, and routes. A new user synchronization mechanism has been added to ensure user data is consistently maintained between Clerk and the application database. The frontend now includes a dedicated PostComposer component and useCreatePost hook for post creation functionality.

```mermaid
graph TB
subgraph "Backend"
A[server.js] --> B[Routes]
B --> C[Controllers]
C --> D[Models]
C --> E[Middleware]
E --> F[Cloudinary]
E --> G[Clerk]
D --> H[(MongoDB)]
end
subgraph "Frontend"
I[Mobile App] --> J[API Calls]
J --> K[useUserSync Hook]
J --> L[useCreatePost Hook]
L --> M[PostComposer Component]
end
J --> A
K --> N[POST /users/sync]
N --> A
M --> O[POST /posts]
O --> A
```

**Diagram sources**
- [server.js](file://backend/src/server.js#L1-L48)
- [post.route.js](file://backend/src/routes/post.route.js#L1-L21)
- [user.route.js](file://backend/src/routes/user.route.js#L1-L19)

**Section sources**
- [server.js](file://backend/src/server.js#L1-L48)
- [post.route.js](file://backend/src/routes/post.route.js#L1-L21)
- [user.route.js](file://backend/src/routes/user.route.js#L1-L19)

## Authentication Data Flow
The authentication flow begins in the mobile app where users log in via Clerk. The authentication token is then sent to the backend with each request. The backend verifies the token using Clerk's middleware and ensures the user is authenticated before processing any protected routes. After successful authentication, the user data is synchronized with the backend database to ensure consistency.

### Authentication Sequence
```mermaid
sequenceDiagram
participant Mobile as "Mobile App"
participant Backend as "Backend Server"
participant Clerk as "Clerk Auth"
Mobile->>Backend : API Request with Clerk Token
Backend->>Clerk : Verify Token (clerkMiddleware)
Clerk-->>Backend : Authentication Result
Backend->>Backend : protectRoute middleware check
alt User Authenticated
Backend->>Mobile : Process Request
Backend-->>Mobile : Success Response
else User Not Authenticated
Backend-->>Mobile : 401 Unauthorized
end
```

**Diagram sources**
- [auth.middleware.js](file://backend/src/middleware/auth.middleware.js#L1-L9)
- [server.js](file://backend/src/server.js#L1-L48)

**Section sources**
- [auth.middleware.js](file://backend/src/middleware/auth.middleware.js#L1-L9)
- [server.js](file://backend/src/server.js#L1-L48)

## User Synchronization Flow
A new user synchronization mechanism has been implemented to ensure that user data from Clerk is automatically synced with the application's MongoDB database upon sign-in. This process is triggered by a React Query mutation in the frontend and handled by a dedicated endpoint in the backend.

### User Synchronization Sequence
```mermaid
sequenceDiagram
participant Mobile as "Mobile App"
participant Backend as "Backend Server"
participant Clerk as "Clerk Auth"
participant DB as "MongoDB"
Mobile->>Mobile : User signs in via Clerk
Mobile->>Mobile : useUserSync hook detects isSignedIn
Mobile->>Backend : POST /users/sync with Clerk token
Backend->>Clerk : Verify token and get userId
Clerk-->>Backend : Authentication successful
Backend->>DB : Check if user exists by clerkId
alt User exists
Backend-->>Mobile : 200 OK, user already exists
else User does not exist
Backend->>Clerk : Fetch user details (email, name, image)
Clerk-->>Backend : User data
Backend->>Backend : Extract and format user data
Backend->>DB : Create new User document
DB-->>Backend : Created user with ID
Backend-->>Mobile : 201 Created with user data
end
```

**Diagram sources**
- [useUserSync.ts](file://mobile/hooks/useUserSync.ts#L1-L26)
- [user.route.js](file://backend/src/routes/user.route.js#L1-L19)
- [user.controller.js](file://backend/src/controllers/user.controller.js#L1-L97)
- [user.model.js](file://backend/src/models/user.model.js#L1-L64)

**Section sources**
- [useUserSync.ts](file://mobile/hooks/useUserSync.ts#L1-L26) - *Added in recent commit*
- [user.controller.js](file://backend/src/controllers/user.controller.js#L1-L97) - *Updated in recent commit*
- [user.route.js](file://backend/src/routes/user.route.js#L1-L19) - *Updated in recent commit*
- [user.model.js](file://backend/src/models/user.model.js#L1-L64) - *Updated in recent commit*
- [api.ts](file://mobile/utils/api.ts#L1-L74) - *Updated in recent commit*

## Post Creation UI Flow
The post creation process begins with the PostComposer component in the mobile app, which provides a user interface for creating posts with text and images. The component uses the useCreatePost hook to manage state and handle the post creation logic.

### Post Creation UI Sequence
```mermaid
sequenceDiagram
participant User as "User"
participant UI as "PostComposer"
participant Hook as "useCreatePost"
participant Mobile as "Mobile App"
User->>UI : Types content in text input
UI->>Hook : Updates content state
User->>UI : Taps image or camera icon
UI->>Hook : Calls pickImageFromGallery or takePhoto
Hook->>Hook : Requests media library or camera permission
alt Permission granted
Hook->>Hook : Launches image picker
Hook->>Hook : Sets selectedImage state
Hook->>UI : Updates UI with selected image
else Permission denied
Hook->>User : Shows permission alert
end
User->>UI : Taps Post button
UI->>Hook : Calls createPost function
Hook->>Hook : Validates content or image
alt Valid input
Hook->>Hook : Creates FormData with content and image
Hook->>Mobile : Initiates API call via useMutation
else Empty input
Hook->>User : Shows empty post alert
end
```

**Diagram sources**
- [PostComposer.tsx](file://mobile/components/PostComposer.tsx#L1-L98)
- [useCreatePost.ts](file://mobile/hooks/useCreatePost.ts#L1-L104)

**Section sources**
- [PostComposer.tsx](file://mobile/components/PostComposer.tsx#L1-L98) - *Added in recent commit*
- [useCreatePost.ts](file://mobile/hooks/useCreatePost.ts#L1-L104) - *Added in recent commit*

## Post Creation Data Flow
The post creation process involves sending text content and/or an image from the mobile app to the backend API, which then stores the data in MongoDB and uploads images to Cloudinary. The frontend uses the useCreatePost hook to manage the post creation process and communicate with the backend API.

### Post Creation Sequence
```mermaid
sequenceDiagram
participant Mobile as "Mobile App"
participant Backend as "Backend Server"
participant DB as "MongoDB"
participant Cloudinary as "Cloudinary"
Mobile->>Backend : POST /api/posts with form-data
Backend->>Backend : protectRoute (auth check)
Backend->>Backend : upload.middleware (file parsing)
Backend->>Backend : Validate content or image
alt Image Present
Backend->>Cloudinary : Upload image (base64)
Cloudinary-->>Backend : Secure URL
Backend->>Backend : Store URL in post data
end
Backend->>DB : Create Post document
DB-->>Backend : Post with ID
Backend-->>Mobile : 201 Created with post data
```

**Diagram sources**
- [post.route.js](file://backend/src/routes/post.route.js#L1-L21)
- [post.controller.js](file://backend/src/controllers/post.controller.js#L1-L159)
- [upload.middleware.js](file://backend/src/middleware/upload.middleware.js#L1-L22)
- [useCreatePost.ts](file://mobile/hooks/useCreatePost.ts#L1-L104)

**Section sources**
- [post.route.js](file://backend/src/routes/post.route.js#L1-L21)
- [post.controller.js](file://backend/src/controllers/post.controller.js#L1-L159)
- [useCreatePost.ts](file://mobile/hooks/useCreatePost.ts#L1-L104) - *Added in recent commit*
- [PostComposer.tsx](file://mobile/components/PostComposer.tsx#L1-L98) - *Added in recent commit*

## Image Upload Pipeline
The image upload pipeline handles the journey from mobile capture to Cloudinary storage and database reference.

### Image Upload Flow
```mermaid
flowchart TD
A[Mobile Capture] --> B["Send as multipart/form-data"]
B --> C["upload.middleware: multer.memoryStorage()"]
C --> D{"Image Validation"}
D --> |Valid| E["Convert to base64"]
D --> |Invalid| F["400: Only image files allowed"]
E --> G["Upload to Cloudinary"]
G --> H{"Upload Success?"}
H --> |Yes| I["Store secure_url in Post"]
H --> |No| J["400: Failed to upload image"]
I --> K["Save Post to MongoDB"]
```

**Diagram sources**
- [upload.middleware.js](file://backend/src/middleware/upload.middleware.js#L1-L22)
- [cloudinary.js](file://backend/src/config/cloudinary.js#L1-L11)
- [post.controller.js](file://backend/src/controllers/post.controller.js#L1-L159)

**Section sources**
- [upload.middleware.js](file://backend/src/middleware/upload.middleware.js#L1-L22)
- [cloudinary.js](file://backend/src/config/cloudinary.js#L1-L11)

## Notification Generation and Propagation
Notifications are generated when users interact with posts (likes, comments) and are stored in the database for retrieval by recipients.

### Notification Sequence
```mermaid
sequenceDiagram
participant UserA as "User A"
participant Backend as "Backend Server"
participant DB as "MongoDB"
participant UserB as "User B"
UserA->>Backend : Like Post (POST /api/posts/ : id/like)
Backend->>Backend : Verify authentication
Backend->>DB : Update post.likes array
alt Not Liking Own Post
Backend->>DB : Create Notification document
DB-->>Backend : Notification saved
end
Backend-->>UserA : 200 OK
UserB->>Backend : GET /api/notifications
Backend->>DB : Find notifications where to = UserB._id
DB-->>Backend : Notifications with populated data
Backend-->>UserB : 200 OK with notifications
```

**Diagram sources**
- [post.controller.js](file://backend/src/controllers/post.controller.js#L1-L159)
- [notification.controller.js](file://backend/src/controllers/notification.controller.js#L1-L37)
- [notification.model.js](file://backend/src/models/notification.model.js#L1-L37)

**Section sources**
- [post.controller.js](file://backend/src/controllers/post.controller.js#L1-L159)
- [notification.controller.js](file://backend/src/controllers/notification.controller.js#L1-L37)

## API Request-Response Cycle
The API request-response cycle includes headers, payload structure, and error handling for all endpoints.

### Request-Response Structure
```mermaid
sequenceDiagram
participant Client as "Client"
participant Server as "Server"
participant Middleware as "Middleware"
participant Controller as "Controller"
Client->>Server : HTTP Request
Server->>Middleware : CORS, JSON parsing
Middleware->>Middleware : clerkMiddleware (auth)
Middleware->>Middleware : Custom middleware
Middleware->>Controller : Route handler
Controller->>Controller : Business logic
alt Success
Controller-->>Client : 2xx Response with data
else Error
Controller-->>Client : 4xx/5xx Response with error
end
Server->>Server : Error handling middleware
```

**Diagram sources**
- [server.js](file://backend/src/server.js#L1-L48)
- [post.route.js](file://backend/src/routes/post.route.js#L1-L21)

**Section sources**
- [server.js](file://backend/src/server.js#L1-L48)

## Data Transformation and Validation
Data undergoes transformation and validation at multiple layers to ensure integrity and security.

### Data Validation Flow
```mermaid
flowchart TD
A[Client Request] --> B["Content-Type: application/json or multipart/form-data"]
B --> C["server.js: express.json() or multer"]
C --> D["auth.middleware: Authentication check"]
D --> E["Route-specific validation"]
E --> F["post.controller: Content/image validation"]
F --> G["Cloudinary: Image transformation"]
G --> H["Mongoose: Schema validation"]
H --> I["Database: Storage"]
```

**Diagram sources**
- [post.controller.js](file://backend/src/controllers/post.controller.js#L1-L159)
- [post.model.js](file://backend/src/models/post.model.js#L1-L37)
- [upload.middleware.js](file://backend/src/middleware/upload.middleware.js#L1-L22)

**Section sources**
- [post.controller.js](file://backend/src/controllers/post.controller.js#L1-L159)
- [post.model.js](file://backend/src/models/post.model.js#L1-L37)

## Security and Error Handling
The system implements multiple security layers and comprehensive error handling.

### Security Measures
- **Authentication**: Clerk integration with `clerkMiddleware` and `protectRoute`
- **Input Validation**: Mongoose schema validation and manual checks
- **File Security**: MIME type checking in upload middleware
- **Rate Limiting**: Arcjet middleware (not fully visible in code)
- **Error Handling**: Global error middleware in server.js

### Error Recovery
```mermaid
flowchart TD
A[Error Occurs] --> B{"Error Type"}
B --> |Client Error| C["4xx Response with message"]
B --> |Server Error| D["5xx Response with generic message"]
B --> |Cloudinary Error| E["Catch and return 400"]
B --> |Database Error| F["Catch and return 500"]
C --> G[Client Handles Error]
D --> G
E --> G
F --> G
```

**Diagram sources**
- [server.js](file://backend/src/server.js#L1-L48)
- [post.controller.js](file://backend/src/controllers/post.controller.js#L1-L159)

**Section sources**
- [server.js](file://backend/src/server.js#L1-L48)
- [post.controller.js](file://backend/src/controllers/post.controller.js#L1-L159)

## Performance Considerations
The system includes several performance optimizations:

- **Image Optimization**: Cloudinary applies automatic quality, format, and size optimization
- **Database Indexing**: Mongoose schemas imply indexing on reference fields
- **Memory Efficiency**: Multer uses memory storage for file uploads to avoid disk I/O
- **Connection Pooling**: Mongoose handles connection pooling to MongoDB
- **Caching**: Not explicitly implemented but could be added for frequent queries

The 5MB file size limit prevents excessive memory usage during image uploads. Cloudinary's CDN delivery ensures fast image loading for end users. The use of async/await with express-async-handler prevents blocking the event loop during I/O operations.