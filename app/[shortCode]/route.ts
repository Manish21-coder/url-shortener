import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Link from "@/lib/models/Link";

export async function GET(
  req: Request,
  context: { params: Promise<{ shortCode: string }> }
) {
  await connectDB();

  // unwrap params
  const { shortCode } = await context.params;

  console.log("Incoming shortcode:", shortCode);

  const link = await Link.findOne({ shortCode });

  console.log("DB result:", link);

  if (!link) {
    return NextResponse.json({ error: "Short link not found" }, { status: 404 });
  }

  const userAgent = req.headers.get("user-agent") ?? "";
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "";

  // Round-robin: pick randomly from group urls if present, else use primary
  const pool: string[] = link.urls?.length > 0 ? link.urls : [link.originalUrl];
  const targetUrl = pool[Math.floor(Math.random() * pool.length)];

  link.clicks += 1;
  link.clickHistory.push({ timestamp: new Date().toISOString(), userAgent, ip });
  await link.save();

  return NextResponse.redirect(targetUrl);
}