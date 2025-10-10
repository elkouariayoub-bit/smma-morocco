"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type PopoverContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext(component: string) {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Popover />`);
  }
  return context;
}

type PopoverProps = {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (next: boolean) => void;
};

function Popover({ children, open: controlledOpen, defaultOpen = false, onOpenChange }: PopoverProps) {
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange]
  );

  const value = React.useMemo<PopoverContextValue>(
    () => ({ open, setOpen, triggerRef }),
    [open, setOpen]
  );

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

type PopoverTriggerProps = React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean;
};

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  };
}

const PopoverTrigger = React.forwardRef<HTMLElement, PopoverTriggerProps>(
  ({ asChild = false, onClick, children, ...props }, forwardedRef) => {
    const { open, setOpen, triggerRef } = usePopoverContext("PopoverTrigger");
    const composedRef = React.useMemo<React.RefCallback<HTMLElement>>(
      () => composeRefs<HTMLElement>(triggerRef as unknown as React.Ref<HTMLElement>, forwardedRef),
      [triggerRef, forwardedRef]
    );

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        setOpen(!open);
      }
    };

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<any>;
      return React.cloneElement(child, {
        ref: composedRef,
        "aria-haspopup": "dialog",
        "aria-expanded": open,
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          child.props.onClick?.(event);
          handleClick(event);
        },
      } as any);
    }

    return (
      <button
        type="button"
        ref={(node) => composedRef(node)}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
PopoverTrigger.displayName = "PopoverTrigger";

type PopoverContentProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "center" | "end";
  sideOffset?: number;
  onPointerDownOutside?: (event: { target: EventTarget | null; preventDefault: () => void }) => void;
  onInteractOutside?: (event: { target: EventTarget | null; preventDefault: () => void }) => void;
};

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    {
      className,
      align = "center",
      sideOffset = 8,
      onPointerDownOutside,
      onInteractOutside,
      style,
      ...props
    },
    forwardedRef
  ) => {
    const { open, setOpen, triggerRef } = usePopoverContext("PopoverContent");
    const contentRef = React.useRef<HTMLDivElement | null>(null);

    const combinedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        contentRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [forwardedRef]
    );

    const [position, setPosition] = React.useState<React.CSSProperties>({ opacity: 0 });

    React.useEffect(() => {
      if (!open || typeof window === "undefined") {
        return;
      }
      const trigger = triggerRef.current;
      const content = contentRef.current;
      if (!trigger || !content) {
        return;
      }
      const rect = trigger.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      let left = rect.left + window.scrollX;
      if (align === "center") {
        left = rect.left + rect.width / 2 - contentRect.width / 2 + window.scrollX;
      } else if (align === "end") {
        left = rect.right - contentRect.width + window.scrollX;
      }
      left = Math.max(8 + window.scrollX, left);
      const top = rect.bottom + sideOffset + window.scrollY;
      setPosition({
        position: "absolute",
        top,
        left,
        zIndex: 10000,
        opacity: 1,
      });
    }, [open, align, sideOffset, triggerRef]);

    React.useEffect(() => {
      if (!open) {
        return;
      }
      const handlePointer = (event: MouseEvent | TouchEvent) => {
        const target = event.target as Node | null;
        const trigger = triggerRef.current;
        const content = contentRef.current;
        const inside = (trigger && trigger.contains(target)) || (content && content.contains(target));
        if (inside) {
          return;
        }
        let prevented = false;
        const preventDefault = () => {
          prevented = true;
        };
        onPointerDownOutside?.({ target, preventDefault });
        onInteractOutside?.({ target, preventDefault });
        if (!prevented) {
          setOpen(false);
        }
      };

      const handleKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", handlePointer);
      document.addEventListener("touchstart", handlePointer);
      document.addEventListener("keydown", handleKey);
      return () => {
        document.removeEventListener("mousedown", handlePointer);
        document.removeEventListener("touchstart", handlePointer);
        document.removeEventListener("keydown", handleKey);
      };
    }, [open, onPointerDownOutside, onInteractOutside, setOpen, triggerRef]);

    if (!open) {
      return null;
    }

    const content = (
      <div
        ref={combinedRef}
        style={{ ...position, ...style }}
        className={cn(
          "rounded-md border border-slate-200 bg-white p-4 text-slate-900 shadow-lg outline-none",
          className
        )}
        {...props}
      />
    );

    if (typeof document === "undefined") {
      return content;
    }

    return createPortal(content, document.body);
  }
);
PopoverContent.displayName = "PopoverContent";

const PopoverAnchor = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => <span ref={ref} className={className} {...props} />
);
PopoverAnchor.displayName = "PopoverAnchor";

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
