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

  // increase click count
  link.clicks += 1;
  await link.save();

  return NextResponse.redirect(link.originalUrl);
}