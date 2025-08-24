import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT || 5001, () =>
      console.log("Server running on PORT 5001")
    );
  } catch (error) {
    console.log("Error starting server",error);
    process.exit(1);
  }
};

startServer();

