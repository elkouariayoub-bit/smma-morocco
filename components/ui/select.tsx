"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type SelectItemData = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
};

type SelectContextValue = {
  items: SelectItemData[];
  registerItem: (item: SelectItemData) => void;
  unregisterItem: (value: string) => void;
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  setPlaceholder: (placeholder?: string) => void;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext(component: string): SelectContextValue {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Select />`);
  }
  return context;
}

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function Select({ value, defaultValue = "", onValueChange, children, className }: SelectProps) {
  const [items, setItems] = React.useState<SelectItemData[]>([]);
  const [placeholder, setPlaceholder] = React.useState<string | undefined>(undefined);
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value! : uncontrolledValue;

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  const registerItem = React.useCallback((item: SelectItemData) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((it) => it.value === item.value);
      if (existingIndex === -1) {
        return [...prev, item];
      }
      const clone = [...prev];
      clone[existingIndex] = item;
      return clone;
    });
  }, []);

  const unregisterItem = React.useCallback((itemValue: string) => {
    setItems((prev) => prev.filter((item) => item.value !== itemValue));
  }, []);

  const contextValue = React.useMemo<SelectContextValue>(
    () => ({
      items,
      registerItem,
      unregisterItem,
      value: currentValue,
      setValue,
      placeholder,
      setPlaceholder,
    }),
    [items, registerItem, unregisterItem, currentValue, setValue, placeholder]
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <div className={cn("relative w-full", className)}>{children}</div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const SelectTrigger = React.forwardRef<HTMLSelectElement, SelectTriggerProps>(
  ({ className, children: _children, ...props }, ref) => {
    const { items, value, setValue, placeholder } = useSelectContext("SelectTrigger");

    return (
      <select
        ref={ref}
        className={cn(
          "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-ring",
          className
        )}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {items.map((item) => (
          <option key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </option>
        ))}
      </select>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

interface SelectValueProps {
  placeholder?: string;
}

function SelectValue({ placeholder }: SelectValueProps) {
  const { setPlaceholder } = useSelectContext("SelectValue");

  React.useEffect(() => {
    setPlaceholder(placeholder);
    return () => setPlaceholder(undefined);
  }, [placeholder, setPlaceholder]);

  return null;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

function SelectContent({ children, className }: SelectContentProps) {
  return (
    <div className={cn("hidden", className)} aria-hidden>
      {children}
    </div>
  );
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function SelectItem({ value, children, disabled }: SelectItemProps) {
  const { registerItem, unregisterItem } = useSelectContext("SelectItem");

  React.useEffect(() => {
    registerItem({ value, label: children, disabled });
    return () => unregisterItem(value);
  }, [value, children, disabled, registerItem, unregisterItem]);

  return null;
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
