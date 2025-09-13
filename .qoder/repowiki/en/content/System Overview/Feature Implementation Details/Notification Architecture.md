# Notification Architecture

<cite>
**Referenced Files in This Document**   
- [notification.model.js](file://backend/src/models/notification.model.js)
- [notification.controller.js](file://backend/src/controllers/notification.controller.js)
- [post.controller.js](file://backend/src/controllers/post.controller.js)
- [comment.controller.js](file://backend/src/controllers/comment.controller.js)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Notification Model Schema](#notification-model-schema)
3. [Notification Creation Triggers](#notification-creation-triggers)
4. [Notification Controller Implementation](#notification-controller-implementation)
5. [Event Triggers from Social Interactions](#event-triggers-from-social-interactions)
6. [Edge Case Handling](#edge-case-handling)
7. [Scalability and Performance Considerations](#scalability-and-performance-considerations)
8. [Extensibility and Integration Guidance](#extensibility-and-integration-guidance)

## Introduction
The notification system in xClone is designed to inform users of relevant social interactions such as likes, comments, and follows. This document details the architecture, implementation, and operational aspects of the notification system. It explains how notifications are generated, stored, retrieved, and managed within the application, with a focus on real-time user engagement and system efficiency.

## Notification Model Schema
The `Notification` model defines the structure of each notification record in the database. It captures essential metadata about the interaction, including the sender, recipient, type of action, and associated content.

```javascript
const notificationSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["follow", "like", "comment"],
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  { timestamps: true }
);
```

### Schema Fields
- **from**: Reference to the user who triggered the notification (e.g., liked a post).
- **to**: Reference to the user receiving the notification.
- **type**: Type of interaction; one of `"follow"`, `"like"`, or `"comment"`.
- **post**: Optional reference to the post involved in the interaction.
- **comment**: Optional reference to a specific comment (used in comment notifications).
- **timestamps**: Automatically adds `createdAt` and `updatedAt` fields.

This schema supports flexible querying and efficient population of related data using Mongoose.

**Section sources**
- [notification.model.js](file://backend/src/models/notification.model.js#L1-L36)

## Notification Controller Implementation
The `notification.controller.js` file contains the core logic for retrieving and managing user notifications.

### Retrieving Notifications
The `getNotifications` function fetches all notifications for the authenticated user, sorted by creation time (newest first), and populates relevant user and content data.

```javascript
export const getNotifications = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);

  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  const notifications = await Notification.find({ to: user._id })
    .sort({ createdAt: -1 })
    .populate("from", "username firstName lastName profilePicture")
    .populate("post", "content image")
    .populate("comment", "content");

  res.status(200).json({ notifications });
});
```

#### Key Features:
- Authenticates user via Clerk (`getAuth`).
- Finds user by `clerkId`.
- Queries notifications where the current user is the recipient (`to` field).
- Sorts results by `createdAt` descending.
- Populates sender details and associated post/comment content for display.

### Deleting Notifications
Users can remove individual notifications using the `deleteNotification` endpoint.

```javascript
export const deleteNotification = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { notificationId } = req.params;

  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    to: user._id,
  });

  if (!notification) return res.status(404).json({ error: "Notification not found" });

  res.status(200).json({ message: "Notification deleted successfully" });
});
```

This ensures users can only delete their own notifications, enforcing access control.

**Section sources**
- [notification.controller.js](file://backend/src/controllers/notification.controller.js#L1-L36)

## Notification Creation Triggers
Notifications are generated automatically when specific social interactions occur. These events are handled in `post.controller.js` and `comment.controller.js`.

### Like Notification Trigger
When a user likes a post that is not their own, a notification is created.

```javascript
// In post.controller.js - likePost function
if (post.user.toString() !== user._id.toString()) {
  await Notification.create({
    from: user._id,
    to: post.user,
    type: "like",
    post: postId,
  });
}
```

This prevents self-notifications and ensures only relevant interactions generate alerts.

### Comment Notification Trigger
When a user comments on a post they don’t own, a notification is sent to the post owner.

```javascript
// In comment.controller.js - createComment function
if (post.user.toString() !== user._id.toString()) {
  await Notification.create({
    from: user._id,
    to: post.user,
    type: "comment",
    post: postId,
    comment: comment._id,
  });
}
```

The notification includes both the post and comment references for context.

**Section sources**
- [post.controller.js](file://backend/src/controllers/post.controller.js#L120-L140)
- [comment.controller.js](file://backend/src/controllers/comment.controller.js#L55-L65)

## Edge Case Handling
The system includes safeguards for common edge cases:

### Notification Deduplication
Currently, the system does not deduplicate notifications. For example, multiple likes on the same post will generate separate notifications. Future improvements could include:
- Using composite keys (from + to + post + type) to prevent duplicates.
- Implementing a "last seen" timestamp to suppress repeated actions.

### Spam Prevention
While basic access controls exist (e.g., only allowing deletion of own notifications), additional spam mitigation strategies could include:
- Rate limiting notification creation per user.
- Temporal cooldowns between similar notifications.
- User-configurable notification preferences.

### Real-Time Delivery Considerations
Currently, notifications are stored and fetched on demand. To support real-time delivery:
- Integrate WebSocket or Firebase for push updates.
- Use a message queue (e.g., RabbitMQ, Kafka) to decouple notification generation from delivery.
- Implement a polling mechanism on the client side with exponential backoff.

## Scalability and Performance Considerations
As the user base grows, performance optimization becomes critical.

### Indexing Strategy
To ensure fast query performance, indexes should be created on frequently queried fields:

```javascript
// Recommended MongoDB index
db.notifications.createIndex({ to: 1, createdAt: -1 })
```

This accelerates retrieval of notifications for a given user, sorted by time.

### Read Status Tracking
Currently, there is no read/unread state tracking. Adding a `read` boolean field would allow:
- Displaying unread counts in the UI.
- Optimizing queries to return only unread notifications when needed.
- Archiving old notifications without deletion.

Example schema extension:
```javascript
read: { type: Boolean, default: false }
```

### Batch Processing
For high-volume operations (e.g., mass follow events), consider:
- Using batch inserts for notifications.
- Offloading notification creation to background workers.
- Employing bulk write operations in MongoDB.

### Soft Deletion Pattern
Instead of permanently deleting notifications, implement soft deletion:

```javascript
deleted: { type: Boolean, default: false },
deletedAt: { type: Date, default: null }
```

This allows recovery, audit logging, and analytics while hiding entries from the UI.

**Section sources**
- [notification.model.js](file://backend/src/models/notification.model.js#L1-L36)
- [notification.controller.js](file://backend/src/controllers/notification.controller.js#L20-L36)

## Extensibility and Integration Guidance
The notification system can be extended to support new features and external services.

### Adding New Notification Types
To support additional types (e.g., "mention", "share"), update the `type` enum:

```javascript
enum: ["follow", "like", "comment", "mention", "share"]
```

Then, trigger notifications from the appropriate controller logic.

### Integrating Push Notification Services
To deliver notifications outside the app:
- Use Firebase Cloud Messaging (FCM) for mobile push.
- Integrate with Apple Push Notification Service (APNs) for iOS.
- Leverage web push APIs for browser notifications.

Example integration flow:
1. On notification creation, check user’s device tokens.
2. Send push payload via FCM/APNs.
3. Include deep link to the relevant content.

### Webhook Support
Expose notification events via webhooks to enable third-party integrations:
- Notify external services when specific actions occur.
- Support user-defined automation (e.g., IFTTT-style rules).

### Analytics and Monitoring
Log notification delivery and engagement metrics:
- Track open rates.
- Monitor delivery latency.
- Detect failed deliveries for retry.

These insights help refine user experience and system reliability.

**Section sources**
- [notification.model.js](file://backend/src/models/notification.model.js#L1-L36)
- [notification.controller.js](file://backend/src/controllers/notification.controller.js#L1-L36)
- [post.controller.js](file://backend/src/controllers/post.controller.js#L120-L140)
- [comment.controller.js](file://backend/src/controllers/comment.controller.js#L55-L65)