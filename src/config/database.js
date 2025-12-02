import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI is not defined in environment variables");
    process.exit(1);
  }

  console.log("🔌 Connecting to MongoDB...");

  try {
    mongoose.set("strictQuery", false);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10s
      connectTimeoutMS: 20000,
    });

    console.log(
      "✅ MongoDB connected:",
      mongoose.connection.host,
      "/",
      mongoose.connection.name
    );
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    if (err.reason) {
      console.error("ℹ️ Reason:", err.reason);
    }
    process.exit(1);
  }
};

export default connectDB;
