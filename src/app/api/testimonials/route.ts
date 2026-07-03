import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/testimonials
export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      orderBy: [
        { isFeatured: "desc" },
        { sortOrder: "asc" },
      ],
    });

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error("Testimonials fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}