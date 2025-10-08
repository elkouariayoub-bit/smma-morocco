"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import { useDateRange } from "@/app/providers/date-range";

export default function ExportMenu() {
  const { range } = useDateRange();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setReady(true), []);

  const navigateTo = (kind: "csv" | "excel" | "pdf") => {
    if (!range.start || !range.end) {
      alert("Pick a date range first.");
      return;
    }

    const baseUrl =
      kind === "csv"
        ? "/api/export/csv"
        : kind === "excel"
        ? "/api/export/excel"
        : "/api/export/pdf";

    window.location.href = `${baseUrl}?start=${range.start}&end=${range.end}`;
    setOpen(false);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      const button = buttonRef.current;
      const menu = menuRef.current;

      if (target && (button?.contains(target) || menu?.contains(target))) {
        return;
      }

      setOpen(false);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const menuStyle = useMemo<CSSProperties>(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) {
      return { display: "none" };
    }

    return {
      position: "fixed",
      top: rect.bottom + 8,
      left: Math.max(8, rect.right - 176),
      width: 176,
      zIndex: 10_000,
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((value) => !value)}
        className="rounded-md border px-3 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Export ▾
      </button>

      {open && ready &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="rounded-lg border bg-white shadow-lg dark:bg-neutral-900"
            role="menu"
          >
            <button
              type="button"
              onClick={() => navigateTo("csv")}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-neutral-800"
              role="menuitem"
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() => navigateTo("excel")}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-neutral-800"
              role="menuitem"
            >
              Excel (.xlsx)
            </button>
            <button
              type="button"
              onClick={() => navigateTo("pdf")}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-neutral-800"
              role="menuitem"
            >
              PDF
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
