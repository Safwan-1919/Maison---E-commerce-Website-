"use client";

import { useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ruler, MoveVertical, CircleDot } from "lucide-react";
import { useStore } from "@/lib/store";

type SizeCategory = "tops" | "bottoms" | "shoes";

interface SizeRow {
  size: string;
  chest: string;
  waist: string;
  hip: string;
  shoulder: string;
}

const topsData: SizeRow[] = [
  { size: "XS", chest: '36"', waist: '28"', hip: '36"', shoulder: '16"' },
  { size: "S", chest: '38"', waist: '30"', hip: '38"', shoulder: '16.5"' },
  { size: "M", chest: '40"', waist: '32"', hip: '40"', shoulder: '17"' },
  { size: "L", chest: '42"', waist: '34"', hip: '42"', shoulder: '17.5"' },
  { size: "XL", chest: '44"', waist: '36"', hip: '44"', shoulder: '18"' },
  { size: "XXL", chest: '46"', waist: '38"', hip: '46"', shoulder: '18.5"' },
];

const bottomsData: SizeRow[] = [
  { size: "XS", chest: "\u2014", waist: '26"', hip: '36"', shoulder: "\u2014" },
  { size: "S", chest: "\u2014", waist: '28"', hip: '38"', shoulder: "\u2014" },
  { size: "M", chest: "\u2014", waist: '30"', hip: '40"', shoulder: "\u2014" },
  { size: "L", chest: "\u2014", waist: '32"', hip: '42"', shoulder: "\u2014" },
  { size: "XL", chest: "\u2014", waist: '34"', hip: '44"', shoulder: "\u2014" },
  { size: "XXL", chest: "\u2014", waist: '36"', hip: '46"', shoulder: "\u2014" },
];

const shoesData: SizeRow[] = [
  { size: "7", chest: '9.6"', waist: '9.4"', hip: "\u2014", shoulder: "\u2014" },
  { size: "8", chest: '9.9"', waist: '9.7"', hip: "\u2014", shoulder: "\u2014" },
  { size: "9", chest: '10.25"', waist: '10"', hip: "\u2014", shoulder: "\u2014" },
  { size: "10", chest: '10.5"', waist: '10.3"', hip: "\u2014", shoulder: "\u2014" },
  { size: "11", chest: '10.8"', waist: '10.6"', hip: "\u2014", shoulder: "\u2014" },
  { size: "12", chest: '11.1"', waist: '10.9"', hip: "\u2014", shoulder: "\u2014" },
];

const categories: { key: SizeCategory; label: string }[] = [
  { key: "tops", label: "Tops" },
  { key: "bottoms", label: "Bottoms" },
  { key: "shoes", label: "Shoes" },
];

function getSizeData(category: SizeCategory): SizeRow[] {
  switch (category) {
    case "tops":
      return topsData;
    case "bottoms":
      return bottomsData;
    case "shoes":
      return shoesData;
  }
}

function getColumnHeaders(category: SizeCategory): { key: keyof SizeRow; label: string }[] {
  if (category === "shoes") {
    return [
      { key: "size", label: "Size (US)" },
      { key: "chest", label: "Foot Length" },
      { key: "waist", label: "Foot Width" },
    ];
  }
  if (category === "bottoms") {
    return [
      { key: "size", label: "Size" },
      { key: "waist", label: "Waist" },
      { key: "hip", label: "Hip" },
    ];
  }
  return [
    { key: "size", label: "Size" },
    { key: "chest", label: "Chest / Bust" },
    { key: "waist", label: "Waist" },
    { key: "hip", label: "Hip" },
    { key: "shoulder", label: "Shoulder" },
  ];
}

const measureSteps = [
  {
    icon: Ruler,
    title: "Chest / Bust",
    instruction: "Measure around the fullest part of your chest, keeping the tape level and snug but not tight.",
  },
  {
    icon: MoveVertical,
    title: "Waist",
    instruction: "Measure around your natural waistline, the narrowest part of your torso above the navel.",
  },
  {
    icon: CircleDot,
    title: "Hips",
    instruction: "Stand with feet together and measure around the fullest part of your hips and buttocks.",
  },
];

const DASH = "\u2014";

export function SizeGuideModal() {
  const { sizeGuideOpen, setSizeGuideOpen } = useStore();
  const [activeCategory, setActiveCategory] = useState<SizeCategory>("tops");
  const subscribeDesktop = (callback: () => void) => {
    const mq = window.matchMedia("(min-width: 768px)");
    mq.addEventListener("change", callback);
    return () => mq.removeEventListener("change", callback);
  };
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false
  );

  const data = getSizeData(activeCategory);
  const columns = getColumnHeaders(activeCategory);

  return (
    <AnimatePresence>
      {sizeGuideOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 z-[100]"
            onClick={() => setSizeGuideOpen(false)}
          />

          {/* Desktop: flex container for centering; Mobile: aligns to bottom */}
          <div
            className="fixed inset-0 z-[110] pointer-events-none flex items-center justify-center"
            style={{ display: isDesktop ? "flex" : "block" }}
          >
            <motion.div
              initial={isDesktop ? { opacity: 0, scale: 0.96, y: 20 } : { opacity: 0, y: "100%" }}
              animate={isDesktop ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, y: 0 }}
              exit={isDesktop ? { opacity: 0, scale: 0.96, y: 20 } : { opacity: 0, y: "100%" }}
              transition={
                isDesktop
                  ? { type: "spring", damping: 30, stiffness: 350 }
                  : { type: "spring", damping: 30, stiffness: 300 }
              }
              className={`pointer-events-auto bg-[#F8F8F6] flex flex-col overflow-hidden ${
                isDesktop
                  ? "w-full max-w-[640px] rounded-[4px] max-h-[85vh] shadow-2xl"
                  : "fixed inset-x-0 bottom-0 max-h-[90vh]"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E8E8] flex-shrink-0">
                <div>
                  <h2 className="text-[15px] font-medium tracking-wide text-[#111]">Size Guide</h2>
                  <p className="text-[12px] text-[#999] mt-0.5">Find your perfect fit</p>
                </div>
                <button
                  onClick={() => setSizeGuideOpen(false)}
                  className="w-9 h-9 flex items-center justify-center hover:opacity-60 transition-opacity"
                  aria-label="Close size guide"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {/* Category Tabs */}
                <div className="px-6 pt-5 pb-4 border-b border-[#E8E8E8]">
                  <div className="inline-flex border border-[#E8E8E8]">
                    {categories.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        className={`px-5 py-2.5 text-[12px] font-medium tracking-wider uppercase transition-all ${
                          activeCategory === cat.key
                            ? "bg-[#111] text-[#F8F8F6]"
                            : "text-[#666] hover:text-[#111]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Measurement Table */}
                <div className="px-6 pt-5 pb-2">
                  <p className="text-[11px] text-[#999] mb-3">All measurements are in inches</p>
                  <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full min-w-[400px]">
                      <thead>
                        <tr className="border-b border-[#E8E8E8]">
                          {columns.map((col) => (
                            <th
                              key={col.key}
                              className={`text-left py-2.5 text-[11px] font-medium tracking-wider uppercase text-[#999] ${
                                col.key === "size" ? "w-20" : ""
                              }`}
                            >
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((row, i) => (
                          <tr
                            key={row.size}
                            className={`border-b border-[#E8E8E8] ${
                              i % 2 === 0 ? "bg-[#F8F8F6]" : "bg-white"
                            }`}
                          >
                            {columns.map((col) => (
                              <td
                                key={col.key}
                                className={`py-2.5 text-[13px] ${
                                  col.key === "size"
                                    ? "font-medium text-[#111]"
                                    : row[col.key] === DASH
                                    ? "text-[#D1D1D1]"
                                    : "text-[#666]"
                                }`}
                              >
                                {row[col.key]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* How to Measure */}
                {activeCategory !== "shoes" && (
                  <div className="px-6 pt-6 pb-4 border-t border-[#E8E8E8]">
                    <h3 className="text-[13px] font-medium tracking-wider uppercase text-[#111] mb-4">
                      How to Measure
                    </h3>
                    <div className="space-y-4">
                      {measureSteps.map((step) => (
                        <div key={step.title} className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-[#E8E8E8] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <step.icon className="w-4 h-4 text-[#4D5B47]" strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-[#111]">{step.title}</p>
                            <p className="text-[12px] text-[#666] leading-relaxed mt-0.5">
                              {step.instruction}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Note */}
                <div className="px-6 pt-4 pb-8">
                  <p className="text-[11px] text-[#999] leading-relaxed">
                    Measurements may vary slightly between styles. When in doubt, we recommend sizing up.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}