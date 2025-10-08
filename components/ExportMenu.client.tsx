"use client";

import { useEffect, useRef, useState } from "react";

import { useDateRange } from "@/app/providers/date-range";

export default function ExportMenu() {
  const { range } = useDateRange();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const csvHref = `/api/export/csv?start=${range.start}&end=${range.end}`;
  const xlsxHref = `/api/export/xlsx?start=${range.start}&end=${range.end}`;
  const pdfHref = `/api/export/pdf?start=${range.start}&end=${range.end}`;

  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickAway);
    return () => document.removeEventListener("click", handleClickAway);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center justify-center rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-neutral-800"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Export ▾
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <a
            href={csvHref}
            className="block px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-800"
          >
            CSV
          </a>
          <a
            href={xlsxHref}
            className="block px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-800"
          >
            Excel (.xlsx)
          </a>
          <a
            href={pdfHref}
            className="block px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-800"
          >
            PDF
          </a>
        </div>
      ) : null}
    </div>
  );
}
