import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { ExtensionCleanup } from "@/components/ExtensionCleanup";
import { BRAND_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${BRAND_NAME} — Premium Fashion`,
  description: "Curated luxury fashion and premium essentials. Discover timeless pieces crafted for the modern wardrobe.",
  keywords: ["luxury fashion", "premium clothing", "designer wear", "essentials", BRAND_NAME],
  authors: [{ name: BRAND_NAME }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: `${BRAND_NAME} — Premium Fashion`,
    description: "Curated luxury fashion and premium essentials.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ExtensionCleanup />
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
