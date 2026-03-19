import { connectDB } from "@/lib/db";
import Link from "@/lib/models/Link";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  await connectDB();

  // 🔥 FIXED CLERK USAGE
  const authData = await auth();
  const userId = authData.userId;

  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  let query: any = {};

  // 🔐 USER FILTER
  if (userId) {
    query.userId = userId;
  } else {
    query.userId = null;
  }

  // 🔍 Search
  if (search) {
    query.$or = [
      { originalUrl: { $regex: search, $options: "i" } },
      { shortCode: { $regex: search, $options: "i" } },
    ];
  }

  // 📅 Date filter
  if (startDate || endDate) {
    query.createdAt = {};

    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  const links = await Link.find(query).sort({ createdAt: -1 });

  return Response.json({ data: links });
}