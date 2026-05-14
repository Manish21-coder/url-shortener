import mongoose from "mongoose";

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined — add it to .env.local");
  }

  // Detect unencoded special characters in credentials that break URI parsing.
  // The @ sign in a password must be written as %40 in the connection string.
  // Quick check: more than one @ means the password contains a raw @ sign.
  const atCount = (MONGODB_URI.match(/@/g) || []).length;
  if (atCount > 1) {
    throw new Error(
      "MONGODB_URI contains an unencoded '@' in the password. " +
      "Replace '@' in the password with '%40' (e.g. Manish@8908 → Manish%408908)."
    );
  }

  // Log the host only (no credentials)
  try {
    const { host } = new URL(MONGODB_URI);
    console.log("[db] Connecting to MongoDB host:", host);
  } catch {
    console.log("[db] Connecting to MongoDB (could not parse URI for logging)");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("[db] MongoDB connected ✅");
      return mongoose;
    }).catch((err) => {
      console.error("[db] MongoDB connection error:", err.message);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;