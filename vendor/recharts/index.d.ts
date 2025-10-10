import * as React from "react";

export interface ResponsiveContainerProps {
  width?: number | string;
  height?: number | string;
  children: React.ReactNode;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps>;

export interface LineChartProps {
  data?: any[];
  width?: number;
  height?: number;
  children?: React.ReactNode;
  role?: string;
  "aria-label"?: string;
}

export const LineChart: React.FC<LineChartProps>;

export interface AreaChartProps extends LineChartProps {}

export const AreaChart: React.FC<AreaChartProps>;

export interface BarChartProps extends LineChartProps {}

export const BarChart: React.FC<BarChartProps>;

export interface LineProps {
  dataKey?: string;
  stroke?: string;
  strokeWidth?: number;
  dot?: boolean;
  type?: string;
}

export const Line: React.FC<LineProps>;

export interface AreaProps {
  dataKey?: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
  type?: string;
}

export const Area: React.FC<AreaProps>;

export interface BarProps {
  dataKey?: string;
  fill?: string;
}

export const Bar: React.FC<BarProps>;

export interface XAxisProps {
  dataKey?: string;
  tickLine?: boolean;
  axisLine?: boolean;
}

export const XAxis: React.FC<XAxisProps>;

export interface YAxisProps {
  tickLine?: boolean;
  axisLine?: boolean;
  ticks?: number;
  tickFormatter?: (value: any) => React.ReactNode;
}

export const YAxis: React.FC<YAxisProps>;

export interface CartesianGridProps {
  vertical?: boolean;
  horizontal?: boolean;
  strokeOpacity?: number;
}

export const CartesianGrid: React.FC<CartesianGridProps>;

export interface TooltipProps {}

export const Tooltip: React.FC<TooltipProps>;
