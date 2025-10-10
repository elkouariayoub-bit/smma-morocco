import * as React from "react";

export interface PopoverRootProps {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Root: React.FC<PopoverRootProps>;

export interface PopoverTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  children?: React.ReactElement;
}

export const Trigger: React.ForwardRefExoticComponent<
  PopoverTriggerProps & React.RefAttributes<HTMLElement>
>;

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  sideOffset?: number;
  onPointerDownOutside?: (event: Event) => void;
  onInteractOutside?: (event: Event) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}

export const Content: React.ForwardRefExoticComponent<
  PopoverContentProps & React.RefAttributes<HTMLDivElement>
>;

export const Portal: React.FC<{ children?: React.ReactNode }>;
export const Anchor: React.FC<{ children?: React.ReactNode }>;
