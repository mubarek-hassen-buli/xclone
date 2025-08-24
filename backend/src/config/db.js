import mongoose from "mongoose";
import { ENV } from "./env.js";
export const connectDB = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log("connected to database successfully");
  } catch (error) {
    console.log("error connecting to database");
    process.exit(1);
  }
};
