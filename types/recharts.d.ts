declare module 'recharts' {
  import * as React from 'react';

  export interface AreaProps extends React.SVGProps<SVGPathElement> {
    dataKey: string;
    type?: string;
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
  }
  export class Area extends React.Component<AreaProps> {}

  export interface AreaChartProps {
    data: any[];
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    children?: React.ReactNode;
  }
  export class AreaChart extends React.Component<AreaChartProps> {}

  export interface CartesianGridProps {
    stroke?: string;
    strokeDasharray?: string;
    vertical?: boolean;
  }
  export class CartesianGrid extends React.Component<CartesianGridProps> {}

  export interface ResponsiveContainerProps {
    width?: string | number;
    height?: string | number;
    children?: React.ReactNode;
  }
  export class ResponsiveContainer extends React.Component<ResponsiveContainerProps> {}

  export interface TooltipProps {
    cursor?: any;
    contentStyle?: React.CSSProperties;
  }
  export class Tooltip extends React.Component<TooltipProps> {}

  export interface XAxisProps {
    dataKey?: string;
    stroke?: string;
    tickLine?: boolean;
    axisLine?: boolean;
  }
  export class XAxis extends React.Component<XAxisProps> {}

  export interface YAxisProps {
    stroke?: string;
    tickLine?: boolean;
    axisLine?: boolean;
    tickFormatter?: (value: number) => string;
  }
  export class YAxis extends React.Component<YAxisProps> {}
}
