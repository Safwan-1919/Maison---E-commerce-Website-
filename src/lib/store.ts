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
  | 'order-tracking';

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
  navigate: (page: Page, productId?: string) => void;
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
      navigate: (page, productId) => {
        set((state) => ({
          previousPage: state.currentPage,
          currentPage: page,
          selectedProductId: productId || null,
          isMobileMenuOpen: false,
          isSearchOpen: false,
        }));
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },
      goBack: () => {
        const { previousPage } = get();
        if (previousPage) {
          set({ currentPage: previousPage, previousPage: null });
        } else {
          set({ currentPage: 'home' });
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
            cartItems: [...state.cartItems, { ...item, quantity: item.quantity || 1, id: `${item.productId}-${item.size}-${item.color}-${Date.now()}` }],
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
        set((state) => ({
          cartItems: state.cartItems.map((i) => (i.id === id ? { ...i, quantity } : i)),
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
      toggleWishlist: (productId) => {
        set((state) => {
          const isIn = state.wishlistItems.includes(productId);
          if (isIn) {
            get().showNotification('Removed from wishlist', 'info');
            return { wishlistItems: state.wishlistItems.filter((id) => id !== productId) };
          }
          get().showNotification('Added to wishlist', 'success');
          return { wishlistItems: [...state.wishlistItems, productId] };
        });
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
      }),
    }
  )
);