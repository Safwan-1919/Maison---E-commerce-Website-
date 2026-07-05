"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export default function NotFound() {
  const { navigate } = useStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-[72px] font-medium text-[#E8E8E8] mb-4">404</h1>
      <p className="text-[14px] text-[#999] mb-8">Page not found</p>
      <button
        onClick={() => navigate("home")}
        className="px-6 py-3 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-[0.2em] uppercase hover:bg-[#333] transition-colors"
      >
        Back to Store
      </button>
    </div>
  );
}
