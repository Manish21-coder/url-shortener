import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Link from "@/lib/models/Link";

export async function GET(
  req: Request,
  { params }: { params: { shortCode: string } }
) {

  await connectDB();

  const link = await Link.findOne({
    shortCode: params.shortCode
  });

  if (!link) {
    return NextResponse.json({ error: "Link not found" });
  }

  return NextResponse.json({
    totalClicks: link.clicks,
    data: link.clickHistory || []
  });
}