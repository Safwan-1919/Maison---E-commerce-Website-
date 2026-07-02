"use client";

import { AnimatePresence, motion } from "framer-motion";
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
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { Notification } from "@/components/layout/Notification";
import { SearchOverlay } from "@/components/layout/SearchOverlay";

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

export default function Home() {
  const { currentPage } = useStore();
  const config = pageConfig[currentPage] || pageConfig.home;
  const PageComponent = config.component;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F6]">
      {config.showNav && <Navigation />}
      <SearchOverlay />
      <CartDrawer />
      <Notification />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex-1"
        >
          <PageComponent />
        </motion.div>
      </AnimatePresence>
      {config.showFooter && <Footer />}
    </div>
  );
}