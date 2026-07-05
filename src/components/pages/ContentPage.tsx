"use client";

import { useStore } from "@/lib/store";
import { BRAND_NAME } from "@/lib/constants";
import { motion } from "framer-motion";
import {
  ArrowLeft, Package, Truck, RotateCcw, Ruler, HelpCircle,
  Mail, Phone, MapPin, Heart, Users, Leaf, Newspaper, Handshake,
  Shield, FileText, Cookie, Eye, Gift, Star, TrendingUp, Tag, CreditCard
} from "lucide-react";

const pageData: Record<string, {
  title: string;
  subtitle: string;
  icon: any;
  sections: { heading: string; content: string }[];
}> = {
  // ── Shop ────────────────────────────────────
  "new-arrivals": {
    title: "New Arrivals",
    subtitle: "Fresh styles just dropped",
    icon: Star,
    sections: [
      { heading: "What's New", content: `Discover the latest additions to the ${BRAND_NAME} collection. Our new arrivals feature carefully curated pieces that blend timeless elegance with contemporary design. From lightweight summer essentials to statement outerwear, each piece is crafted with meticulous attention to detail.` },
      { heading: "This Season", content: "Our SS26 collection draws inspiration from architectural minimalism and natural textures. Expect clean silhouettes, premium fabrics like Italian linen and Japanese cotton, and a muted palette that transitions effortlessly from day to night." },
    ],
  },
  "best-sellers": {
    title: "Best Sellers",
    subtitle: "Most loved by our community",
    icon: TrendingUp,
    sections: [
      { heading: "Customer Favorites", content: `These are the pieces our customers can't stop wearing. From our signature tailored blazers to the everyday essentials that redefine casual luxury, our best sellers represent the perfect balance of style, comfort, and quality.` },
      { heading: "Why They're Loved", content: "Every best seller starts with exceptional materials and construction. We listen to feedback, refine fits, and ensure each piece meets the exacting standards our customers expect from the brand." },
    ],
  },
  "trending": {
    title: "Trending",
    subtitle: "What everyone's wearing right now",
    icon: TrendingUp,
    sections: [
      { heading: "Right Now", content: `Explore what's capturing attention across the fashion world. Our trending picks reflect the intersection of runway inspiration and real-world wearability — pieces that make a statement without trying too hard.` },
      { heading: "Style Notes", content: "This season's trends lean toward relaxed tailoring, tonal dressing, and textured fabrics. Layering remains key, with lightweight knits and structured overshirts leading the way." },
    ],
  },
  "sale": {
    title: "Sale",
    subtitle: "Investment pieces at exceptional value",
    icon: Tag,
    sections: [
      { heading: "The Edit", content: `Our sale features previous season favorites and select pieces at reduced prices. Each item maintains the same quality and craftsmanship as our full-price collection — exceptional value on timeless pieces.` },
      { heading: "Terms", content: "Sale items are subject to availability. Returns and exchanges are accepted within 30 days of delivery, provided items are in original condition with all tags attached. Sale items cannot be combined with other promotions." },
    ],
  },
  "gift-cards": {
    title: "Gift Cards",
    subtitle: "Give the gift of choice",
    icon: Gift,
    sections: [
      { heading: "Digital Gift Cards", content: `Not sure what to gift? A ${BRAND_NAME} gift card lets them choose exactly what they love. Available in denominations from ₹2,000 to ₹25,000, delivered instantly via email with a personalized message.` },
      { heading: "How It Works", content: "Select your amount, add a personal message, and the gift card is delivered to the recipient's inbox within minutes. Gift cards are valid for 12 months from the date of purchase and can be used across any product on our store." },
    ],
  },

  // ── Help ────────────────────────────────────
  "contact": {
    title: "Contact Us",
    subtitle: "We'd love to hear from you",
    icon: Mail,
    sections: [
      { heading: "Get in Touch", content: `Whether you have a question about an order, need styling advice, or want to share feedback — our team is here to help. We aim to respond within 24 hours during business days.` },
      { heading: "Email", content: "support@maison.com" },
      { heading: "Phone", content: "+91 1800-123-4567 (Mon–Sat, 10AM–7PM IST)" },
      { heading: "Address", content: `${BRAND_NAME} Fashion Pvt. Ltd.\nLevel 12, One World Center\nMumbai 400001, India` },
    ],
  },
  "shipping": {
    title: "Shipping Info",
    subtitle: "Fast, reliable delivery to your doorstep",
    icon: Truck,
    sections: [
      { heading: "Domestic Shipping", content: `We offer free standard shipping on all orders above ₹2,000. For orders below ₹2,000, a flat shipping fee of ₹149 applies. Standard delivery takes 3–5 business days across India.` },
      { heading: "Express Delivery", content: "Need it sooner? Express delivery is available for ₹299 and delivers within 1–2 business days in major metro cities. Express orders placed before 2PM are dispatched the same day." },
      { heading: "Tracking", content: "Every order comes with a tracking number. You can track your package in real-time from your account dashboard or via the link in your shipping confirmation email." },
    ],
  },
  "returns": {
    title: "Returns & Exchanges",
    subtitle: "Hassle-free returns within 30 days",
    icon: RotateCcw,
    sections: [
      { heading: "Our Policy", content: `We want you to love your purchase. If something isn't right, you can return or exchange items within 30 days of delivery. Items must be unworn, unwashed, and have all original tags attached.` },
      { heading: "How to Return", content: "Log into your account, go to Order History, and select the item you'd like to return. Print the prepaid shipping label, pack the item securely, and drop it off at your nearest courier center. Refunds are processed within 5–7 business days of receiving the return." },
      { heading: "Exchanges", content: "Need a different size or color? Select 'Exchange' instead of 'Return' and choose your preferred replacement. We'll ship the new item as soon as we receive your return." },
    ],
  },
  "size-guide": {
    title: "Size Guide",
    subtitle: "Find your perfect fit",
    icon: Ruler,
    sections: [
      { heading: "How to Measure", content: `Chest: Measure around the fullest part of your chest, keeping the tape horizontal.\nWaist: Measure around your natural waistline, the narrowest part of your torso.\nHips: Measure around the fullest part of your hips.\nInseam: Measure from the crotch to the bottom of the ankle.` },
      { heading: "Men's Tops", content: "S: Chest 36–38\" | M: Chest 38–40\" | L: Chest 40–42\" | XL: Chest 42–44\" | XXL: Chest 44–46\"" },
      { heading: "Men's Bottoms", content: "S: Waist 28–30\" | M: Waist 30–32\" | L: Waist 32–34\" | XL: Waist 34–36\" | XXL: Waist 36–38\"" },
      { heading: "Women's Tops", content: "XS: Bust 30–32\" | S: Bust 32–34\" | M: Bust 34–36\" | L: Bust 36–38\" | XL: Bust 38–40\"" },
      { heading: "Need Help?", content: "If you're between sizes, we generally recommend sizing up for a relaxed fit or sizing down for a slimmer silhouette. Our stylists are also available via live chat to help you find the perfect fit." },
    ],
  },
  "faq": {
    title: "FAQs",
    subtitle: "Quick answers to common questions",
    icon: HelpCircle,
    sections: [
      { heading: "How do I track my order?", content: "Once your order is shipped, you'll receive a tracking number via email and SMS. You can also track your order from the 'My Orders' section in your account." },
      { heading: "Can I cancel my order?", content: "Orders can be cancelled within 1 hour of placement. After that, the order enters processing and cannot be cancelled. You can still return the item once delivered." },
      { heading: "What payment methods do you accept?", content: `We accept all major credit/debit cards, UPI, net banking, and popular wallets like Paytm and PhonePe. We also offer EMI options on orders above ₹5,000 through select banks.` },
      { heading: "Are the products authentic?", content: `Every item on ${BRAND_NAME} is 100% authentic. We source directly from brands and authorized distributors. Each product comes with a certificate of authenticity.` },
      { heading: "How do I use a coupon code?", content: "Enter your coupon code at checkout in the 'Apply Coupon' field. The discount will be applied to your order total. Only one coupon can be used per order." },
    ],
  },

  // ── Company ──────────────────────────────────
  "about": {
    title: "About Us",
    subtitle: "Crafting timeless fashion since 2020",
    icon: Users,
    sections: [
      { heading: "Our Story", content: `${BRAND_NAME} was born from a simple belief: exceptional fashion shouldn't be inaccessible. We partner with the world's finest mills and artisans to create pieces that rival luxury houses at a fraction of the price.` },
      { heading: "Our Mission", content: "To redefine modern wardrobes with thoughtfully designed, sustainably produced clothing that empowers individuals to express their personal style with confidence." },
      { heading: "Our Values", content: "Quality over quantity. Transparency in everything we do. Respect for people and planet. These aren't just words — they're the principles behind every decision we make, from fabric sourcing to final delivery." },
    ],
  },
  "careers": {
    title: "Careers",
    subtitle: "Join our team",
    icon: Users,
    sections: [
      { heading: "Working at Maison", content: `We're a team of designers, engineers, and dreamers building the future of fashion. We value creativity, curiosity, and a relentless pursuit of excellence. If you're passionate about creating extraordinary experiences, we want to hear from you.` },
      { heading: "Open Positions", content: "We're currently looking for:\n• Senior Fashion Designer\n• Full-Stack Developer\n• Brand Marketing Manager\n• Supply Chain Analyst\n• Content Strategist\n\nSend your portfolio and resume to careers@maison.com" },
      { heading: "Internships", content: "We offer paid internships across design, technology, and marketing. Our internship program is designed to give you real responsibility and mentorship from industry leaders." },
    ],
  },
  "sustainability": {
    title: "Sustainability",
    subtitle: "Fashion with a conscience",
    icon: Leaf,
    sections: [
      { heading: "Our Approach", content: `Sustainability isn't a marketing tagline for us — it's woven into every aspect of our business. From sourcing organic and recycled materials to minimizing waste in our supply chain, we're committed to reducing our environmental impact.` },
      { heading: "Materials", content: "Over 60% of our fabrics are sourced from certified sustainable mills. We use organic cotton, recycled polyester, Tencel, and other eco-conscious materials wherever possible." },
      { heading: "Packaging", content: "All our packaging is made from recycled materials and is fully recyclable. We've eliminated single-use plastics from our supply chain and are working toward carbon-neutral shipping by 2027." },
    ],
  },
  "press": {
    title: "Press",
    subtitle: "Featured in",
    icon: Newspaper,
    sections: [
      { heading: "In the News", content: `${BRAND_NAME} has been featured in Vogue India, GQ, Harper's Bazaar, Economic Times, and numerous international publications. We're proud of the recognition and continue to push boundaries in fashion and sustainability.` },
      { heading: "Press Inquiries", content: "For press inquiries, interview requests, or collaboration proposals, please contact press@maison.com. We respond to all media inquiries within 48 hours." },
      { heading: "Brand Assets", content: "Download our brand kit including logos, fonts, and color guidelines from our press page. All assets are available for editorial use with proper attribution." },
    ],
  },
  "affiliates": {
    title: "Affiliates",
    subtitle: "Earn with every referral",
    icon: Handshake,
    sections: [
      { heading: "How It Works", content: `Join our affiliate program and earn commission on every sale you refer. Share your unique link, and when someone makes a purchase through it, you earn up to 12% commission.` },
      { heading: "Benefits", content: "• Up to 12% commission on every sale\n• 30-day cookie duration\n• Dedicated affiliate dashboard\n• Exclusive seasonal promotions\n• Early access to new collections\n• Monthly payouts via bank transfer" },
      { heading: "Apply Now", content: "Ready to start? Email affiliates@maison.com with your website/blog details and social media profiles. We review applications within 5 business days." },
    ],
  },

  // ── Legal ────────────────────────────────────
  "privacy": {
    title: "Privacy Policy",
    subtitle: "How we protect your data",
    icon: Shield,
    sections: [
      { heading: "Information We Collect", content: `We collect information you provide directly: name, email, phone number, shipping address, and payment details. We also collect usage data like browsing history and device information to improve your experience.` },
      { heading: "How We Use Your Information", content: "We use your information to process orders, send shipping updates, provide customer support, personalize your shopping experience, and (with your consent) send promotional communications." },
      { heading: "Data Protection", content: "We implement industry-standard encryption and security measures. Your payment information is processed through PCI-compliant gateways and is never stored on our servers." },
      { heading: "Your Rights", content: "You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at privacy@maison.com. We will respond within 30 days." },
    ],
  },
  "terms": {
    title: "Terms of Service",
    subtitle: "The fine print",
    icon: FileText,
    sections: [
      { heading: "Acceptance", content: `By using ${BRAND_NAME}'s website and services, you agree to these Terms of Service. Please read them carefully before making a purchase.` },
      { heading: "Products & Pricing", content: "All product descriptions, images, and specifications are as accurate as possible. Colors may vary slightly due to display settings. Prices are in Indian Rupees and include applicable taxes unless stated otherwise." },
      { heading: "Orders & Payment", content: "An order is confirmed only after successful payment verification. We reserve the right to cancel orders in case of pricing errors, stock unavailability, or suspected fraudulent activity." },
      { heading: "Intellectual Property", content: "All content on this website — including designs, images, logos, and text — is the property of Maison and protected by intellectual property laws. Unauthorized use is prohibited." },
    ],
  },
  "cookie-policy": {
    title: "Cookie Policy",
    subtitle: "How we use cookies",
    icon: Cookie,
    sections: [
      { heading: "What Are Cookies", content: "Cookies are small text files stored on your device when you visit our website. They help us remember your preferences and improve your browsing experience." },
      { heading: "Types We Use", content: "• Essential Cookies: Required for the website to function (cart, checkout, authentication)\n• Analytics Cookies: Help us understand how visitors interact with our site\n• Marketing Cookies: Used to deliver relevant advertisements\n• Preference Cookies: Remember your settings and choices" },
      { heading: "Managing Cookies", content: "You can control cookie preferences through your browser settings. Disabling essential cookies may affect website functionality." },
    ],
  },
  "accessibility": {
    title: "Accessibility",
    subtitle: "Fashion for everyone",
    icon: Eye,
    sections: [
      { heading: "Our Commitment", content: `${BRAND_NAME} is committed to making our website accessible to everyone, regardless of ability. We follow WCAG 2.1 guidelines and continuously work to improve the user experience for all visitors.` },
      { heading: "Features", content: "• Keyboard navigation support\n• Screen reader compatible\n• Alt text on all images\n• High contrast mode\n• Resizable text\n• Focus indicators" },
      { heading: "Feedback", content: "If you encounter any accessibility barriers, please let us know at accessibility@maison.com. Your feedback helps us improve." },
    ],
  },
};

// Fallback for shop filters
const shopPages: Record<string, { title: string; subtitle: string; fetchParam: string }> = {
  "new-arrivals": { title: "New Arrivals", subtitle: "Fresh styles just dropped", fetchParam: "new=true&sort=newest" },
  "best-sellers": { title: "Best Sellers", subtitle: "Most loved", fetchParam: "sort=bestselling" },
  "trending": { title: "Trending", subtitle: "What everyone's wearing", fetchParam: "sort=trending" },
  "sale": { title: "Sale", subtitle: "Exceptional value", fetchParam: "discount=10,100" },
  "gift-cards": { title: "Gift Cards", subtitle: "Give the gift of choice", fetchParam: "" },
};

export function ContentPage({ contentKey }: { contentKey: string }) {
  const { navigate } = useStore();

  // If it's a shop filter page, redirect to shop
  if (shopPages[contentKey]) {
    navigate("shop", undefined, undefined, contentKey);
    return null;
  }

  const data = pageData[contentKey];
  if (!data) {
    return (
      <main className="min-h-screen bg-[#F8F8F6] pt-24 pb-16">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          <button
            onClick={() => navigate("home")}
            suppressHydrationWarning
            className="flex items-center gap-2 text-[12px] tracking-widest uppercase text-[#666] hover:text-[#111] transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </button>
          <h1 className="text-[28px] sm:text-[36px] font-medium text-[#111] mb-4">Page Not Found</h1>
          <p className="text-[15px] text-[#666]">The page you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </main>
    );
  }

  const Icon = data.icon;

  return (
    <main className="min-h-screen bg-[#F8F8F6]">
      {/* Hero */}
      <div className="bg-[#111] text-[#F8F8F6] pt-24 pb-16">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-8 h-[1px] bg-white/20" />
              <Icon className="w-4 h-4 text-white/40" strokeWidth={1.5} />
              <span className="w-8 h-[1px] bg-white/20" />
            </div>
            <h1 className="text-[28px] sm:text-[36px] md:text-[42px] font-medium tracking-[-0.02em] mb-2">
              {data.title}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-white/50">{data.subtitle}</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <button
          onClick={() => navigate("home")}
          suppressHydrationWarning
          className="flex items-center gap-2 text-[12px] tracking-widest uppercase text-[#666] hover:text-[#111] transition-colors mb-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </button>

        <div className="space-y-10">
          {data.sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h2 className="text-[18px] sm:text-[20px] font-medium text-[#111] mb-3">
                {section.heading}
              </h2>
              <div className="text-[14px] sm:text-[15px] text-[#666] leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom divider */}
        <div className="mt-16 pt-8 border-t border-[#E8E8E8]">
          <p className="text-[12px] text-[#999] text-center">
            Last updated: January 2026 · {BRAND_NAME} Fashion Pvt. Ltd.
          </p>
        </div>
      </div>
    </main>
  );
}
