"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { CheckCircle, XCircle, Info } from "lucide-react";

export function Notification() {
  const { notification, clearNotification } = useStore();

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed top-20 left-1/2 z-[100] px-5 py-3 bg-[#111] text-[#F8F8F6] flex items-center gap-3 shadow-lg"
        >
          {notification.type === "success" && <CheckCircle className="w-4 h-4 text-[#4D5B47]" />}
          {notification.type === "error" && <XCircle className="w-4 h-4 text-red-400" />}
          {notification.type === "info" && <Info className="w-4 h-4 text-[#B79B7B]" />}
          <span className="text-[13px] font-medium">{notification.message}</span>
          <button onClick={clearNotification} className="ml-2 opacity-60 hover:opacity-100">
            <XCircle className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}