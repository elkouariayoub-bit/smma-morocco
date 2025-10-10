import * as React from "react";

export interface TabsRootProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  orientation?: "horizontal" | "vertical";
}

export const Root: React.FC<TabsRootProps>;

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}
export const List: React.ForwardRefExoticComponent<
  TabsListProps & React.RefAttributes<HTMLDivElement>
>;

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}
export const Trigger: React.ForwardRefExoticComponent<
  TabsTriggerProps & React.RefAttributes<HTMLButtonElement>
>;

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}
export const Content: React.ForwardRefExoticComponent<
  TabsContentProps & React.RefAttributes<HTMLDivElement>
>;
