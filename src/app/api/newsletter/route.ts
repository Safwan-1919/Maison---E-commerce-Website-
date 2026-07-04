import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { success: false, message: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email } = body as { email?: string };

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if already subscribed
    const existing = await db.newsletter.findUnique({
      where: { email: trimmedEmail },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({
          success: true,
          message: "You're already subscribed to our newsletter!",
        });
      } else {
        // Re-activate
        await db.newsletter.update({
          where: { email: trimmedEmail },
          data: { isActive: true },
        });
        return NextResponse.json({
          success: true,
          message: "Welcome back! Your subscription has been reactivated.",
        });
      }
    }

    await db.newsletter.create({
      data: { email: trimmedEmail },
    });

    return NextResponse.json({
      success: true,
      message: "Subscribed successfully! Welcome to the MAISON family.",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}