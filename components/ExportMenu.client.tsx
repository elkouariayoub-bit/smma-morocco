"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import { useDateRange } from "@/app/providers/date-range";

export default function ExportMenu() {
  const { range } = useDateRange();
  const [open, setOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const csvHref = `/api/export/csv?start=${range.start}&end=${range.end}`;
  const xlsxHref = `/api/export/excel?start=${range.start}&end=${range.end}`;
  const pdfHref = `/api/export/pdf?start=${range.start}&end=${range.end}`;

  useEffect(() => setPortalReady(true), []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      const button = buttonRef.current;
      const menu = menuRef.current;

      if (target && button?.contains(target)) {
        return;
      }

      if (target && menu?.contains(target)) {
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
      zIndex: 10_000,
      width: 176,
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

      {open && portalReady &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="rounded-lg border bg-white shadow-lg dark:bg-neutral-900"
            role="menu"
          >
            <a
              className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800"
              href={csvHref}
              role="menuitem"
            >
              CSV
            </a>
            <a
              className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800"
              href={xlsxHref}
              role="menuitem"
            >
              Excel (.xlsx)
            </a>
            <a
              className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800"
              href={pdfHref}
              role="menuitem"
            >
              PDF
            </a>
          </div>,
          document.body
        )}
    </div>
  );
}
