import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import postRouters from "./routes/post.route.js";
import userRouters from "./routes/user.route.js";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/users", userRouters);
app.use("/api/posts", postRouters);
// error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});
const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT || 5001, () =>
      console.log("Server running on PORT 5001")
    );
  } catch (error) {
    console.log("Error starting server", error);
    process.exit(1);
  }
};

startServer();
