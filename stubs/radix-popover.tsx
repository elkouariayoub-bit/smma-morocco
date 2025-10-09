"use client";

import * as React from "react";
import { createPortal } from "react-dom";

type PopoverContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext(component: string) {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error(`${component} must be used within <PopoverPrimitive.Root>`);
  }
  return context;
}

type RootProps = {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function Root({ children, open, defaultOpen = false, onOpenChange }: RootProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = typeof open === "boolean";
  const currentOpen = isControlled ? (open as boolean) : uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  React.useEffect(() => {
    if (isControlled) {
      setUncontrolledOpen(open as boolean);
    }
  }, [isControlled, open]);

  const value = React.useMemo(() => ({ open: currentOpen, setOpen }), [currentOpen, setOpen]);

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

const Anchor = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ children, ...props }, ref) => (
    <span ref={ref} {...props}>
      {children}
    </span>
  )
);
Anchor.displayName = "PopoverAnchor";

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    });
  };
}

type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean };

const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(({ asChild, onClick, children, ...props }, ref) => {
  const { open, setOpen } = usePopoverContext("PopoverPrimitive.Trigger");

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      setOpen(!open);
    }
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement;
    return React.cloneElement(child, {
      ...props,
      ref: mergeRefs(ref, (child as React.ReactElement & { ref?: React.Ref<HTMLButtonElement> }).ref),
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        child.props?.onClick?.(event);
        if (!event.defaultPrevented) {
          setOpen(!open);
        }
      },
    });
  }

  return (
    <button type="button" {...props} ref={ref} onClick={handleClick}>
      {children}
    </button>
  );
});
Trigger.displayName = "PopoverTrigger";

type ContentProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  align?: "start" | "center" | "end";
};

const Content = React.forwardRef<HTMLDivElement, ContentProps>(
  ({ side = "bottom", sideOffset = 0, align = "center", style, children, ...props }, forwardedRef) => {
    const { open, setOpen } = usePopoverContext("PopoverPrimitive.Content");
    const localRef = React.useRef<HTMLDivElement | null>(null);
    const ref = mergeRefs(forwardedRef, localRef);

    React.useEffect(() => {
      if (!open) return;

      const handleMouseDown = (event: MouseEvent) => {
        if (!localRef.current) return;
        if (localRef.current.contains(event.target as Node)) return;
        setOpen(false);
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [open, setOpen]);

    if (!open) return null;

    const node = (
      <div
        {...props}
        ref={ref}
        data-state={open ? "open" : "closed"}
        data-side={side}
        data-align={align}
        style={{ ...style, margin: sideOffset ? `${sideOffset}px` : undefined }}
      >
        {children}
      </div>
    );

    if (typeof document === "undefined") {
      return node;
    }

    return createPortal(node, document.body);
  }
);
Content.displayName = "PopoverContent";

const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (typeof document === "undefined") {
    return <>{children}</>;
  }
  return createPortal(children as React.ReactElement, document.body);
};
Portal.displayName = "PopoverPortal";

export const __STUB__ = true;

export { Root, Trigger, Content, Anchor, Portal };
