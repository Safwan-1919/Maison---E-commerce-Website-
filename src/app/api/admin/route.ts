// DEPRECATED: This route has been moved to /api/admin/stats/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "This endpoint has been moved to /api/admin/stats" },
    { status: 308 } // Permanent redirect
  );
}