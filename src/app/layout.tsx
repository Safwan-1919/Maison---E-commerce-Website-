import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "MAISON — Premium Fashion",
  description: "Curated luxury fashion and premium essentials. Discover timeless pieces crafted for the modern wardrobe.",
  keywords: ["luxury fashion", "premium clothing", "designer wear", "essentials", "MAISON"],
  authors: [{ name: "MAISON" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "MAISON — Premium Fashion",
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
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}