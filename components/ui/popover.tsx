"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type PopoverContextValue = {
  open: boolean;
  toggle: () => void;
  close: () => void;
  setOpen: (value: boolean) => void;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within <Popover>");
  }
  return context;
}

export interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Popover({ children, open, onOpenChange }: PopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = typeof open === "boolean";
  const currentOpen = isControlled ? open : internalOpen;

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternalOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  const toggle = React.useCallback(() => {
    setOpen(!currentOpen);
  }, [currentOpen, setOpen]);

  const contextValue = React.useMemo<PopoverContextValue>(
    () => ({
      open: currentOpen,
      toggle,
      close: () => setOpen(false),
      setOpen,
    }),
    [currentOpen, toggle, setOpen]
  );

  return (
    <PopoverContext.Provider value={contextValue}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
}

export interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactElement;
}

export const PopoverTrigger = React.forwardRef<HTMLElement, PopoverTriggerProps>(
  ({ asChild, children }, ref) => {
    const { toggle } = usePopoverContext();

    const handleClick = (event: React.MouseEvent) => {
      children.props.onClick?.(event);
      if (!event.defaultPrevented) {
        toggle();
      }
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children,
        { onClick: handleClick } as Record<string, unknown>
      );
    }

    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} type="button" onClick={handleClick}>
        {children}
      </button>
    );
  }
);
PopoverTrigger.displayName = "PopoverTrigger";

export interface PopoverContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
  align?: "start" | "center" | "end";
}

export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, style, children, ...props }, ref) => {
    const { open } = usePopoverContext();

    if (!open) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "absolute left-0 z-50 mt-2 min-w-[200px] rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-lg",
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PopoverContent.displayName = "PopoverContent";

export const PopoverAnchor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
