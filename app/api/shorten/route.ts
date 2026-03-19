import { connectDB } from "@/lib/db";
import Link from "@/lib/models/Link";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔐 Safe auth handling
    let userId = null;
    try {
      const authData = await auth();
      userId = authData.userId;
    } catch (err) {
      console.log("Auth error (guest user):", err);
    }

    // 🔥 GET alias & prefix
    const { originalUrl, prefix, alias } = await req.json();

    if (!originalUrl) {
      return Response.json({ error: "URL required" }, { status: 400 });
    }

    let shortCode;

    if (alias) {
      // ✅ Use alias as-is (after cleaning)
      shortCode = alias.trim().toLowerCase().replace(/[^a-z0-9\-]/g, "");
      const exists = await Link.findOne({ shortCode });
      if (exists) {
        return Response.json({ error: "Alias already exists" }, { status: 400 });
      }
    } else {
      // 🔥 CLEAN PREFIX (important)
      const cleanPrefix =
        prefix?.trim().toLowerCase().replace(/[^a-z0-9]/g, "") || "mani";

      // 🔥 ENSURE UNIQUE SHORTCODE
      let exists = true;
      while (exists) {
        const randomPart = Math.random().toString(36).substring(2, 6);
        shortCode = `${cleanPrefix}-${randomPart}`;

        const existing = await Link.findOne({ shortCode });
        if (!existing) exists = false;
      }
    }

    const newLink = await Link.create({
      originalUrl,
      shortCode,
      userId: userId || null,
    });

    return Response.json({ data: newLink });

  } catch (error) {
    console.error("SHORTEN API ERROR:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}