import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const items = await db.siteContent.findMany();
    const content: Record<string, string> = {};
    for (const item of items) {
      content[item.key] = item.value;
    }
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch site content" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "object") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    for (const [key, value] of Object.entries(content)) {
      await db.siteContent.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e.message === "Forbidden") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update site content" }, { status: 500 });
  }
}
