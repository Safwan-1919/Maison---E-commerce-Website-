import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(1, "Pincode is required"),
  isDefault: z.boolean().optional(),
});

const deleteAddressSchema = z.object({
  index: z.number().int().min(0),
});

// POST /api/user/addresses - Add a new address
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    // Get current addresses
    const currentUser = await db.user.findUnique({
      where: { id: user.id },
      select: { addresses: true },
    });

    let addresses: any[] = [];
    if (currentUser?.addresses) {
      try {
        addresses = JSON.parse(currentUser.addresses);
        if (!Array.isArray(addresses)) addresses = [];
      } catch {
        addresses = [];
      }
    }

    // Add new address
    const newAddress = parsed.data;
    if (newAddress.isDefault) {
      addresses = addresses.map((a: any) => ({ ...a, isDefault: false }));
    }
    addresses.push(newAddress);

    await db.user.update({
      where: { id: user.id },
      data: { addresses: JSON.stringify(addresses) },
    });

    return NextResponse.json({ success: true, addresses }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("Address creation error:", error);
    return NextResponse.json({ error: "Failed to add address" }, { status: 500 });
  }
}

// DELETE /api/user/addresses - Remove address by index
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = deleteAddressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { index } = parsed.data;

    const currentUser = await db.user.findUnique({
      where: { id: user.id },
      select: { addresses: true },
    });

    let addresses: any[] = [];
    if (currentUser?.addresses) {
      try {
        addresses = JSON.parse(currentUser.addresses);
        if (!Array.isArray(addresses)) addresses = [];
      } catch {
        addresses = [];
      }
    }

    if (index >= addresses.length) {
      return NextResponse.json({ error: "Address index out of bounds" }, { status: 400 });
    }

    addresses.splice(index, 1);

    await db.user.update({
      where: { id: user.id },
      data: { addresses: JSON.stringify(addresses) },
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("Address deletion error:", error);
    return NextResponse.json({ error: "Failed to remove address" }, { status: 500 });
  }
}