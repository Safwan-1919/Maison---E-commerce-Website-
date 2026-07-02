import { NextRequest, NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body as { email?: string };

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // In production, save to database here
    // await db.newsletter.create({ data: { email: email.trim() } });

    return NextResponse.json({
      success: true,
      message: "Subscribed successfully!",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Please enter a valid email address" },
      { status: 400 }
    );
  }
}