import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Page =
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'wishlist'
  | 'account'
  | 'admin'
  | 'order-tracking'
  | 'content';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export interface FilterState {
  category: string[];
  priceRange: [number, number];
  brands: string[];
  sizes: string[];
  colors: string[];
  ratings: number;
  availability: boolean;
  sortBy: string;
  search: string;
}

interface StoreState {
  // Navigation
  currentPage: Page;
  previousPage: Page | null;
  selectedProductId: string | null;
  selectedOrderNumber: string | null;
  contentPage: string | null;
  navigate: (page: Page, productId?: string, orderNumber?: string, contentPage?: string) => void;
  goBack: () => void;

  // Cart
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  getCartTotal: () => number;
  getCartMrpTotal: () => number;
  getCartCount: () => number;

  // Wishlist
  wishlistItems: string[];
  toggleWishlist: (productId: string) => void;
  syncWishlistFromDB: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;

  // Filters
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;

  // Search
  isSearchOpen: boolean;
  searchQuery: string;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;

  // UI
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Applied coupon
  appliedCoupon: { code: string; type: string; discount: number; minOrder: number | null } | null;
  setAppliedCoupon: (coupon: { code: string; type: string; discount: number; minOrder: number | null } | null) => void;
  clearCoupon: () => void;

  // Recently viewed
  recentlyViewed: string[];
  addToRecentlyViewed: (productId: string) => void;

  // Quick View
  quickViewProductId: string | null;
  setQuickViewProductId: (id: string | null) => void;

  // Product Comparison
  compareItems: string[];
  isCompareOpen: boolean;
  addToCompare: (productId: string) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  setCompareOpen: (open: boolean) => void;

  // Auth Modal
  isAuthOpen: boolean;
  setAuthOpen: (open: boolean) => void;

  // Size Guide
  sizeGuideOpen: boolean;
  setSizeGuideOpen: (open: boolean) => void;

  // Notification
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearNotification: () => void;
}

const defaultFilters: FilterState = {
  category: [],
  priceRange: [0, 50000],
  brands: [],
  sizes: [],
  colors: [],
  ratings: 0,
  availability: false,
  sortBy: 'popularity',
  search: '',
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Navigation
  currentPage: 'home',
  previousPage: null,
  selectedProductId: null,
  selectedOrderNumber: null,
  contentPage: null,
      navigate: (page, productId, orderNumber, contentPage) => {
    set((state) => ({
      previousPage: state.currentPage,
      currentPage: page,
      selectedProductId: productId || null,
      selectedOrderNumber: orderNumber || null,
      contentPage: contentPage || null,
      isMobileMenuOpen: false,
      isSearchOpen: false,
    }));
        if (typeof window !== 'undefined') {
          const url = page === 'home' ? '/' : contentPage ? `/${contentPage}` : `/${page}${productId ? `/${productId}` : ''}${orderNumber ? `/${orderNumber}` : ''}`;
          window.history.pushState({ page, productId, orderNumber, contentPage }, '', url);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },
      goBack: () => {
        const { previousPage } = get();
        if (previousPage) {
          set({ currentPage: previousPage, previousPage: null, contentPage: null });
        } else {
          set({ currentPage: 'home', contentPage: null });
        }
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },

      // Cart
      cartItems: [],
      isCartOpen: false,
      addToCart: (item) => {
        set((state) => {
          const existing = state.cartItems.find(
            (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
          );
          if (existing) {
            return {
              cartItems: state.cartItems.map((i) =>
                i.id === existing.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
              ),
            };
          }
          return {
            cartItems: [...state.cartItems, { ...item, quantity: item.quantity || 1, id: `${item.productId}-${item.size}-${item.color}-${crypto.randomUUID()}` }],
          };
        });
        get().showNotification('Added to cart', 'success');
      },
      removeFromCart: (id) => {
        set((state) => ({
          cartItems: state.cartItems.filter((i) => i.id !== id),
        }));
      },
      updateCartQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }
        // Enforce max quantity of 10
        const capped = Math.min(quantity, 10);
        set((state) => ({
          cartItems: state.cartItems.map((i) => (i.id === id ? { ...i, quantity: capped } : i)),
        }));
      },
      clearCart: () => set({ cartItems: [] }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      setCartOpen: (open) => set({ isCartOpen: open }),
      getCartTotal: () => get().cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
      getCartMrpTotal: () => get().cartItems.reduce((total, item) => total + item.mrp * item.quantity, 0),
      getCartCount: () => get().cartItems.reduce((count, item) => count + item.quantity, 0),

      // Wishlist
      wishlistItems: [],
      toggleWishlist: async (productId) => {
        const isIn = get().wishlistItems.includes(productId);
        // Optimistic update
        set((state) => ({
          wishlistItems: isIn
            ? state.wishlistItems.filter((id) => id !== productId)
            : [...state.wishlistItems, productId],
        }));
        get().showNotification(isIn ? 'Removed from wishlist' : 'Added to wishlist', isIn ? 'info' : 'success');
        // Sync with DB
        try {
          const method = isIn ? 'DELETE' : 'POST';
          await fetch('/api/wishlist', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId }),
          });
        } catch {
          // Revert on error
          set((state) => ({
            wishlistItems: isIn
              ? [...state.wishlistItems, productId]
              : state.wishlistItems.filter((id) => id !== productId),
          }));
          get().showNotification('Failed to update wishlist', 'error');
        }
      },
      syncWishlistFromDB: async () => {
        try {
          const res = await fetch('/api/wishlist');
          if (res.ok) {
            const data = await res.json();
            const ids = (data.wishlistItems || []).map((item: { productId: string }) => item.productId);
            set({ wishlistItems: ids });
          }
        } catch {}
      },
      isInWishlist: (productId) => get().wishlistItems.includes(productId),

      // Filters
      filters: defaultFilters,
      setFilter: (key, value) => {
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        }));
      },
      resetFilters: () => set({ filters: defaultFilters }),

      // Search
      isSearchOpen: false,
      searchQuery: '',
      setSearchOpen: (open) => set({ isSearchOpen: open, searchQuery: open ? get().searchQuery : '' }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      // UI
      isMobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

      // Applied coupon (persists from cart to checkout)
      appliedCoupon: null as { code: string; type: string; discount: number; minOrder: number | null } | null,
      setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
      clearCoupon: () => set({ appliedCoupon: null }),

      // Recently viewed
      recentlyViewed: [],
      addToRecentlyViewed: (productId) => {
        set((state) => {
          const filtered = state.recentlyViewed.filter((id) => id !== productId);
          return { recentlyViewed: [productId, ...filtered].slice(0, 12) };
        });
      },

      // Quick View
      quickViewProductId: null,
      setQuickViewProductId: (id) => set({ quickViewProductId: id }),

      // Product Comparison
      compareItems: [],
      isCompareOpen: false,
      addToCompare: (productId) => {
        set((state) => {
          if (state.compareItems.includes(productId)) {
            get().showNotification('Removed from comparison', 'info');
            return { compareItems: state.compareItems.filter((id) => id !== productId) };
          }
          if (state.compareItems.length >= 4) {
            get().showNotification('You can compare up to 4 products', 'error');
            return state;
          }
          get().showNotification('Added to comparison', 'success');
          return { compareItems: [...state.compareItems, productId] };
        });
      },
      removeFromCompare: (productId) => {
        set((state) => ({
          compareItems: state.compareItems.filter((id) => id !== productId),
        }));
      },
      clearCompare: () => set({ compareItems: [] }),
      isInCompare: (productId) => get().compareItems.includes(productId),
      setCompareOpen: (open) => set({ isCompareOpen: open }),

      // Auth Modal
      isAuthOpen: false,
      setAuthOpen: (open) => set({ isAuthOpen: open }),

      // Size Guide
      sizeGuideOpen: false,
      setSizeGuideOpen: (open) => set({ sizeGuideOpen: open }),

      // Notification
      notification: null,
      showNotification: (message, type = 'success') => {
        set({ notification: { message, type } });
        setTimeout(() => get().clearNotification(), 3000);
      },
      clearNotification: () => set({ notification: null }),
    }),
    {
      name: 'maison-store',
      partialize: (state) => ({
        cartItems: state.cartItems,
        wishlistItems: state.wishlistItems,
        recentlyViewed: state.recentlyViewed,
        compareItems: state.compareItems,
        appliedCoupon: state.appliedCoupon,
      }),
    }
  )
);