import * as React from "react";

type ChartProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  [key: string]: any;
};

function createStubComponent(name: string) {
  const Component = React.forwardRef<HTMLDivElement, ChartProps>(
    ({ children, className, style, ...rest }, ref) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`recharts stub: rendering ${name}.`);
      }

      return (
        <div
          ref={ref}
          data-recharts-stub={name}
          className={className}
          style={{ width: "100%", height: "100%", ...style }}
          {...rest}
        >
          {children}
        </div>
      );
    }
  );

  Component.displayName = name;
  return Component;
}

const passthrough = <T extends React.PropsWithChildren<Record<string, unknown>>>(
  name: string,
  Component: React.FC<T>
): React.FC<T> => {
  const Wrapped: React.FC<T> = ({ children, ...rest }) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`recharts stub: rendering ${name}.`);
    }
    return <Component {...(rest as T)}>{children}</Component>;
  };
  Wrapped.displayName = name;
  return Wrapped;
};

type ResponsiveChildFn = (dimensions: { width: number | string; height: number | string }) => React.ReactNode;

type ResponsiveContainerProps = ChartProps & {
  width?: number | string;
  height?: number | string;
  children?: React.ReactNode | ResponsiveChildFn;
};

export const ResponsiveContainer = ({
  children,
  width = "100%",
  height = "100%",
  className,
  style,
  ...rest
}: ResponsiveContainerProps) => {
  if (process.env.NODE_ENV !== "production") {
    console.warn("recharts stub: rendering ResponsiveContainer.");
  }

  const content =
    typeof children === "function"
      ? (children as ResponsiveChildFn)({ width, height })
      : children;

  return (
    <div
      data-recharts-stub="ResponsiveContainer"
      className={className}
      style={{ width, height, position: "relative", ...style }}
      {...rest}
    >
      {content}
    </div>
  );
};

export const LineChart = createStubComponent("LineChart");
export const BarChart = createStubComponent("BarChart");
export const AreaChart = createStubComponent("AreaChart");
export const PieChart = createStubComponent("PieChart");
export const ComposedChart = createStubComponent("ComposedChart");
export const RadarChart = createStubComponent("RadarChart");

const FragmentComponent: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({ children }) => (
  <React.Fragment>{children}</React.Fragment>
);

export const Line = passthrough("Line", FragmentComponent);
export const Bar = passthrough("Bar", FragmentComponent);
export const Area = passthrough("Area", FragmentComponent);
export const Pie = passthrough("Pie", FragmentComponent);
export const Cell = passthrough("Cell", FragmentComponent);
export const Radar = passthrough("Radar", FragmentComponent);

export const XAxis = createStubComponent("XAxis");
export const YAxis = createStubComponent("YAxis");
export const ZAxis = createStubComponent("ZAxis");
export const PolarAngleAxis = createStubComponent("PolarAngleAxis");
export const PolarRadiusAxis = createStubComponent("PolarRadiusAxis");
export const CartesianGrid = createStubComponent("CartesianGrid");
export const Tooltip = createStubComponent("Tooltip");
export const Legend = createStubComponent("Legend");
export const ReferenceLine = createStubComponent("ReferenceLine");
export const ReferenceArea = createStubComponent("ReferenceArea");
export const ReferenceDot = createStubComponent("ReferenceDot");
export const Brush = createStubComponent("Brush");
export const ScatterChart = createStubComponent("ScatterChart");
export const Scatter = passthrough("Scatter", FragmentComponent);
export const RadialBarChart = createStubComponent("RadialBarChart");
export const RadialBar = passthrough("RadialBar", FragmentComponent);
export const Treemap = createStubComponent("Treemap");
export const FunnelChart = createStubComponent("FunnelChart");
export const Funnel = passthrough("Funnel", FragmentComponent);
export const Sankey = createStubComponent("Sankey");
export const ErrorBar = createStubComponent("ErrorBar");
export const TooltipWrapper = createStubComponent("TooltipWrapper");
export const Surface = createStubComponent("Surface");
export const Customized = passthrough("Customized", FragmentComponent);

export type TooltipProps<TData extends Record<string, unknown>> = {
  active?: boolean;
  label?: string | number;
  payload?: TData[];
};

export default {
  ResponsiveContainer,
  LineChart,
  BarChart,
  AreaChart,
  PieChart,
  ComposedChart,
  RadarChart,
  Line,
  Bar,
  Area,
  Pie,
  Cell,
  Radar,
  XAxis,
  YAxis,
  ZAxis,
  PolarAngleAxis,
  PolarRadiusAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
  Brush,
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar,
  Treemap,
  FunnelChart,
  Funnel,
  Sankey,
  ErrorBar,
  TooltipWrapper,
  Surface,
  Customized,
};
