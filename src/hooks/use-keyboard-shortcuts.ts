"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { setCommandPaletteOpen } = useUIStore();

  useEffect(() => {
    const shortcuts: Shortcut[] = [
      {
        key: "k",
        metaKey: true,
        action: () => setCommandPaletteOpen(true),
        description: "Open command palette",
      },
      {
        key: "n",
        metaKey: true,
        shiftKey: true,
        action: () => router.push("/cold-emails?new=true"),
        description: "New cold email",
      },
      {
        key: "d",
        metaKey: true,
        shiftKey: true,
        action: () => router.push("/"),
        description: "Go to dashboard",
      },
    ];

    const handler = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const matchesMeta =
          !shortcut.metaKey || e.metaKey || e.ctrlKey;
        const matchesShift =
          !shortcut.shiftKey || e.shiftKey;
        const matchesKey = e.key.toLowerCase() === shortcut.key;

        if (matchesMeta && matchesShift && matchesKey) {
          if (shortcut.metaKey || shortcut.ctrlKey) {
            e.preventDefault();
          }
          shortcut.action();
          return;
        }
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [router, setCommandPaletteOpen]);
}
