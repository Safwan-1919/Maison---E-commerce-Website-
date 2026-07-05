"use client";

import dynamic from "next/dynamic";

const SPAApp = dynamic(() => import("../page"), { ssr: false });

export default function CatchAllPage() {
  return <SPAApp />;
}
