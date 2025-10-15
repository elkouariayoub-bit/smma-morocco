"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type SeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
};

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, role, ...props }, ref) => (
    <div
      ref={ref}
      role={decorative ? "presentation" : role ?? "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "vertical" ? "h-full w-px" : "h-px w-full",
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = "Separator";

export { Separator };
