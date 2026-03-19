import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Link from "@/lib/models/Link";

// Next.js 14+ App Router: params is a Promise
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ shortCode: string }> }
) {
  await connectDB();

  // unwrap the Promise
  const { shortCode } = await context.params;

  const link = await Link.findOne({ shortCode });

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  return NextResponse.json({
    totalClicks: link.clicks,
    data: link.clickHistory || [],
  });
}