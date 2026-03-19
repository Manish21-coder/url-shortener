import { connectDB } from "@/lib/db";
import Link from "@/lib/models/Link";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request, context: { params: Promise<{ shortCode: string }> }) {
  try {
    await connectDB();

    // Unwrap params
    const { shortCode } = await context.params;

    // Optional: auth
    let userId = null;
    try {
      const authData = await auth();
      userId = authData.userId;
    } catch (err) {
      console.log("Guest user:", err);
    }

    const link = await Link.findOne({
      shortCode,
      // userId: userId || null, // optional if you want user-specific links
    });

    if (!link) {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ data: link }), { status: 200 });
  } catch (err) {
    console.error("LINK FETCH ERROR:", err);
    return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
  }
}