'use client'

import { useStore } from "@/lib/store"
import { CartPage } from "@/components/pages/CartPage"
import { CheckoutPage } from "@/components/pages/CheckoutPage"
import { WishlistPage } from "@/components/pages/WishlistPage"
import { Navigation } from "@/components/layout/Navigation"
import { CartDrawer } from "@/components/layout/CartDrawer"
import { Footer } from "@/components/layout/Footer"
import { Notification } from "@/components/layout/Notification"
import { SearchOverlay } from "@/components/layout/SearchOverlay"

export default function Home() {
  const { currentPage } = useStore()

  const renderPage = () => {
    switch (currentPage) {
      case 'cart':
        return <CartPage />
      case 'checkout':
        return <CheckoutPage />
      case 'wishlist':
        return <WishlistPage />
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
            <div className="w-24 h-24 relative">
              <img
                src="https://z-cdn.chatglm.cn/z-ai/static/logo.svg"
                alt="MAISON"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[14px] text-[#666]">Welcome to MAISON</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F6]">
      <Navigation />
      <SearchOverlay />
      <CartDrawer />
      <Notification />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
    </div>
  )
}