"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useStore } from "@/lib/store";
import HomePage from "@/components/pages/HomePage";
import ShopPage from "@/components/pages/ShopPage";
import ProductPage from "@/components/pages/ProductPage";
import CartPage from "@/components/pages/CartPage";
import CheckoutPage from "@/components/pages/CheckoutPage";
import WishlistPage from "@/components/pages/WishlistPage";
import AccountPage from "@/components/pages/AccountPage";
import OrderTrackingPage from "@/components/pages/OrderTrackingPage";
import AdminPage from "@/components/pages/AdminPage";
import { Navigation } from "@/components/layout/Navigation";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { Notification } from "@/components/layout/Notification";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { QuickViewModal } from "@/components/shared/QuickViewModal";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { CompareDrawer } from "@/components/layout/CompareDrawer";
import { SizeGuideModal } from "@/components/shared/SizeGuideModal";
import { NewsletterPopup } from "@/components/shared/NewsletterPopup";
import { GitCompareArrows, X } from "lucide-react";
import { useCallback, useRef } from "react";

const pageConfig: Record<string, { component: React.ComponentType; showNav: boolean; showFooter: boolean }> = {
  home: { component: HomePage, showNav: true, showFooter: true },
  shop: { component: ShopPage, showNav: true, showFooter: true },
  product: { component: ProductPage, showNav: true, showFooter: true },
  cart: { component: CartPage, showNav: true, showFooter: true },
  checkout: { component: CheckoutPage, showNav: true, showFooter: false },
  wishlist: { component: WishlistPage, showNav: true, showFooter: true },
  account: { component: AccountPage, showNav: true, showFooter: true },
  "order-tracking": { component: OrderTrackingPage, showNav: true, showFooter: true },
  admin: { component: AdminPage, showNav: true, showFooter: true },
};

function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const size = 40;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const onScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      setVisible(scrollY > 600);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min(scrollY / docHeight, 1));
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onScroll]);

  const strokeDashoffset = circumference - progress * circumference;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-[60] w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-shadow"
          aria-label="Back to top"
        >
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox={`0 0 ${size} ${size}`}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#E8E8E8"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#4D5B47"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-150 ease-out"
            />
          </svg>
          <ArrowUp className="w-4 h-4 text-[#111] relative z-10" strokeWidth={1.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const { currentPage, compareItems, setCompareOpen, clearCompare } = useStore();
  const config = pageConfig[currentPage] || pageConfig.home;
  const PageComponent = config.component;
  const [showSkeleton, setShowSkeleton] = useState(false);
  const prevPageRef = useRef(currentPage);

  useEffect(() => {
    if (prevPageRef.current !== currentPage) {
      prevPageRef.current = currentPage;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowSkeleton(true);
      const hideT = setTimeout(() => setShowSkeleton(false), 150);
      return () => clearTimeout(hideT);
    }
  }, [currentPage]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F6]">
      {config.showNav && <AnnouncementBar />}
      {config.showNav && <Navigation />}
      <SearchOverlay />
      <CartDrawer />
      <Notification />
      <QuickViewModal />
      <CompareDrawer />
      <SizeGuideModal />
      <NewsletterPopup />

      {/* Floating Compare Bar */}
      <AnimatePresence>
        {compareItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-[#111] text-[#F8F8F6] px-5 py-3 flex items-center gap-4 shadow-2xl"
          >
            <GitCompareArrows className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[12px] font-medium tracking-wide">
              {compareItems.length} item{compareItems.length !== 1 ? "s" : ""} to compare
            </span>
            <div className="flex items-center gap-1.5">
              {compareItems.slice(0, 3).map((id, i) => (
                <div
                  key={`${id}-${i}`}
                  className="w-6 h-6 bg-[#333] border border-[#555] overflow-hidden"
                >
                  <img
                    src={`/api/products/${id}/image`}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              ))}
              {compareItems.length > 3 && (
                <span className="text-[11px] text-[#999]">+{compareItems.length - 3}</span>
              )}
            </div>
            <button
              onClick={() => setCompareOpen(true)}
              className="ml-2 px-4 py-1.5 bg-[#F8F8F6] text-[#111] text-[11px] font-medium tracking-widest uppercase hover:bg-white transition-colors"
            >
              Compare
            </button>
            <button
              onClick={clearCompare}
              className="w-6 h-6 flex items-center justify-center hover:bg-[#333] transition-colors rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex-1"
        >
          {showSkeleton ? <PageSkeleton /> : <PageComponent />}
        </motion.div>
      </AnimatePresence>
      {config.showFooter && <Footer />}
      <BackToTop />
    </div>
  );
}