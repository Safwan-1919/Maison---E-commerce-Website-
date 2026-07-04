"use client";

import { useEffect } from "react";

export function ExtensionCleanup() {
  useEffect(() => {
    document.querySelectorAll("[fdprocessedid]").forEach((el) => {
      el.removeAttribute("fdprocessedid");
    });
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1) {
            const el = n as Element;
            if (el.hasAttribute("fdprocessedid")) {
              el.removeAttribute("fdprocessedid");
            }
            el.querySelectorAll?.("[fdprocessedid]").forEach((e) => {
              e.removeAttribute("fdprocessedid");
            });
          }
        });
      });
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["fdprocessedid"],
    });
    return () => observer.disconnect();
  }, []);

  return null;
}
