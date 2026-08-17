"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

function getIsBrowser() {
  return typeof document !== "undefined";
}

function subscribe() {
  return () => {};
}

export function SubmittingOverlay() {
  const isBrowser = useSyncExternalStore(subscribe, getIsBrowser, () => false);

  if (!isBrowser) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="rounded-xl bg-white p-6 shadow-lg text-center max-w-sm mx-4">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#49805e] border-t-transparent" />
        <p className="text-lg font-medium text-[#2d4f3a]">Enviando censo...</p>
        <p className="text-sm text-muted-foreground mt-1">
          Por favor, no cierre esta ventana.
        </p>
      </div>
    </div>,
    document.body
  );
}
