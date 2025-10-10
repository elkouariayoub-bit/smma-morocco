"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string | undefined;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

function useTabsContext(component: string) {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error(`${component} must be used within <Tabs>`);
  }
  return context;
}

type TabsProps = {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
};

export function Tabs({
  defaultValue,
  value: valueProp,
  onValueChange,
  className,
  children,
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState<string | undefined>(
    valueProp ?? defaultValue,
  );

  React.useEffect(() => {
    if (valueProp !== undefined) {
      setInternalValue(valueProp);
    }
  }, [valueProp]);

  const setValue = React.useCallback(
    (next: string) => {
      if (valueProp === undefined) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [valueProp, onValueChange],
  );

  const contextValue = React.useMemo(
    () => ({ value: valueProp ?? internalValue, setValue }),
    [valueProp, internalValue, setValue],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn("flex flex-col", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gray-100 p-1 text-sm text-gray-600",
        className,
      )}
      {...props}
    />
  );
}

type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

export function TabsTrigger({ className, value, disabled, ...props }: TabsTriggerProps) {
  const { value: selectedValue, setValue } = useTabsContext("TabsTrigger");
  const isActive = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          setValue(value);
        }
      }}
      className={cn(
        "rounded-full px-3 py-1.5 font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow",
        "data-[state=inactive]:text-gray-500 hover:text-gray-900",
        disabled && "opacity-50",
        className,
      )}
      {...props}
    />
  );
}

type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export function TabsContent({ className, value, ...props }: TabsContentProps) {
  const { value: selectedValue } = useTabsContext("TabsContent");
  const hidden = selectedValue !== value;

  return (
    <div
      role="tabpanel"
      hidden={hidden}
      data-state={hidden ? "inactive" : "active"}
      className={cn("mt-4", className)}
      {...props}
    />
  );
}
