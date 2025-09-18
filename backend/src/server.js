import express from "express";
import helmet from "helmet";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import postRouters from "./routes/post.route.js";
import userRouters from "./routes/user.route.js";
import commentRouters from "./routes/comment.route.js";
import notificationRouters from "./routes/notification.route.js";
import { arcjetMiddleware } from "./middleware/arcjet.middleware.js";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());
app.use(arcjetMiddleware);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/users", userRouters);
app.use("/api/posts", postRouters);
app.use("/api/comments", commentRouters);
app.use("/api/notifications", notificationRouters);
// error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});
const startServer = async () => {
  try {
    await connectDB();
    //listen for local development
    if (ENV.NODE_ENV !== "production") {
      app.listen(ENV.PORT || 5001, () =>
        console.log("Server running on PORT 5001")
      );
    }
  } catch (error) {
    console.log("Error starting server", error);
    process.exit(1);
  }
};

startServer();
//export for vercel
export default app;
