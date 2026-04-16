import { connectDB } from "@/lib/db";
import Link from "@/lib/models/Link";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const folders = await Link.distinct("folder", {
    userId,
    folder: { $exists: true, $ne: "" },
  });

  return NextResponse.json({ data: folders.sort() });
}
