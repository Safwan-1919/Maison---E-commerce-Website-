# MAISON Worklog

## Task 5: Cart Page, Checkout Page, and Wishlist Page

### Files Created
- `src/components/pages/CartPage.tsx` — Full shopping bag page
- `src/components/pages/CheckoutPage.tsx` — Multi-step checkout flow
- `src/components/pages/WishlistPage.tsx` — Wishlist with product grid

### File Updated
- `src/app/page.tsx` — Wired up page routing with Navigation, Footer, CartDrawer, Notification, SearchOverlay

### CartPage Features
- Breadcrumb navigation (Home > Shopping Bag)
- Empty state with illustration and CTA
- Cart items list with image, name, brand, size/color, price, quantity controls, remove, line total
- AnimatePresence for smooth remove animations
- Order Summary sidebar (desktop right, mobile below): subtotal (MRP), discount savings, coupon input with apply/remove, shipping estimate (free over ₹2000, else ₹149), total
- Coupon system: POST to /api/coupons, validates min order, shows discount, remove option
- Free shipping progress bar
- "Proceed to Checkout" and "Continue Shopping" buttons
- Trust badges: Secure Payment, Free Returns, Authentic Products

### CheckoutPage Features
- 3-step progress bar: Shipping → Payment → Review
- Step 1 (Shipping): Full address form with validation (name, email, phone, address, city, state dropdown, pincode, country=India)
- Step 2 (Payment): Radio selection for Credit/Debit Card, UPI, Net Banking, Wallet, COD. Card form with number/expiry/CVV. UPI ID input. COD confirmation message
- Step 3 (Review): Order items, shipping address, payment method display, price breakdown, edit links, terms checkbox
- Order Success: Animated checkmark, order number, total, estimated delivery date, "Continue Shopping"
- POST to /api/orders on place order, clears cart on success
- Collapsible order summary sidebar (desktop sticky, mobile toggle)

### WishlistPage Features
- Breadcrumb navigation (Home > Wishlist)
- Empty state with heart icon and "Explore Products" CTA
- Fetches products from /api/products?limit=50, filters client-side by wishlistItems
- 2/3/4 column responsive grid using existing ProductCard
- "Move to Bag" button on each product card
- "Clear All" button in header
- Loading skeletons, error handling, edge case for removed products