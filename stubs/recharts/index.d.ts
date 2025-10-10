import * as React from "react";

export interface ResponsiveContainerProps {
  width?: number | string;
  height?: number | string;
  children?: React.ReactNode;
}
export const ResponsiveContainer: React.FC<ResponsiveContainerProps>;

export interface LineChartProps extends React.HTMLAttributes<HTMLDivElement> {}
export const LineChart: React.ForwardRefExoticComponent<
  LineChartProps & React.RefAttributes<HTMLDivElement>
>;

export interface LineProps extends React.HTMLAttributes<HTMLElement> {}
export const Line: React.ForwardRefExoticComponent<LineProps & React.RefAttributes<HTMLElement>>;

export const Tooltip: React.FC<Record<string, unknown>>;

export interface AxisProps extends React.HTMLAttributes<HTMLElement> {}
export const YAxis: React.ForwardRefExoticComponent<AxisProps & React.RefAttributes<HTMLElement>>;
export const XAxis: React.ForwardRefExoticComponent<AxisProps & React.RefAttributes<HTMLElement>>;

export interface CartesianGridProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CartesianGrid: React.ForwardRefExoticComponent<
  CartesianGridProps & React.RefAttributes<HTMLDivElement>
>;
