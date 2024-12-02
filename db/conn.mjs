import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

try {
  await mongoose.connect(process.env.MONGO_URI);
} catch (e) {
  console.error(e);
}

let db = mongoose.connection;

export default db;