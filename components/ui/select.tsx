"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OptionRecord {
  value: string;
  label: React.ReactNode;
}

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  registerOption: (option: OptionRecord) => void;
  options: OptionRecord[];
  containerRef: React.RefObject<HTMLDivElement>;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext(component: string) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Select />`);
  }
  return context;
}

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<OptionRecord[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const registerOption = React.useCallback((option: OptionRecord) => {
    setOptions((current) => {
      const exists = current.find((item) => item.value === option.value);
      if (exists) {
        return current.map((item) =>
          item.value === option.value ? option : item
        );
      }
      return [...current, option];
    });
  }, []);

  React.useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const contextValue = React.useMemo(
    () => ({
      value,
      onValueChange,
      open,
      setOpen,
      registerOption,
      options,
      containerRef,
    }),
    [value, onValueChange, open, registerOption, options]
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <div ref={containerRef} className="relative inline-flex w-full flex-col">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, disabled, children, ...props }, ref) => {
    const { open, setOpen } = useSelectContext("SelectTrigger");
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-2xl border border-gray-300 bg-white px-3 py-1 text-sm outline-none transition-colors focus:ring-2 focus:ring-gray-400",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen(!open);
        }}
        {...props}
      >
        <span className="flex-1 text-left">{children}</span>
        <svg
          aria-hidden="true"
          className="ml-2 h-4 w-4 text-gray-500"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

export interface SelectContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open } = useSelectContext("SelectContent");
    if (!open) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "absolute left-0 top-[calc(100%+0.5rem)] z-50 w-full rounded-xl border border-gray-200 bg-white p-1 shadow-lg",
          className
        )}
        role="listbox"
        {...props}
      >
        <div className="flex flex-col gap-1">{children}</div>
      </div>
    );
  }
);
SelectContent.displayName = "SelectContent";

export interface SelectItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const SelectItem = React.forwardRef<HTMLButtonElement, SelectItemProps>(
  ({ value, className, children, disabled, ...props }, ref) => {
    const { value: selected, onValueChange, setOpen, registerOption } =
      useSelectContext("SelectItem");

    React.useEffect(() => {
      registerOption({ value, label: children });
    }, [value, children, registerOption]);

    const isSelected = selected === value;

    return (
      <button
        ref={ref}
        type="button"
        role="option"
        aria-selected={isSelected}
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100",
          isSelected && "bg-gray-100 font-medium",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          onValueChange(value);
          setOpen(false);
        }}
        {...props}
      >
        <span>{children}</span>
        {isSelected ? (
          <svg
            aria-hidden="true"
            className="h-4 w-4 text-gray-900"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M5 10l3 3 7-7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </button>
    );
  }
);
SelectItem.displayName = "SelectItem";

export interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const { value, options } = useSelectContext("SelectValue");
  const selected = options.find((option) => option.value === value)?.label;

  return (
    <span className={cn("block truncate", !selected && "text-gray-400")}>{
      selected ?? placeholder ?? ""
    }</span>
  );
}
