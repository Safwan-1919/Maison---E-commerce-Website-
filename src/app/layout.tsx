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
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          // Remove attributes injected by browser extensions before React hydrates
          document.querySelectorAll('[fdprocessedid]').forEach(function(el){el.removeAttribute('fdprocessedid')});
          // Observer to catch extensions that inject attributes after initial load
          new MutationObserver(function(mutations){mutations.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1&&n.hasAttribute&&n.hasAttribute('fdprocessedid')){n.removeAttribute('fdprocessedid')}if(n.querySelectorAll){n.querySelectorAll('[fdprocessedid]').forEach(function(e){e.removeAttribute('fdprocessedid')})}})})}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['fdprocessedid']});
        `}} />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}