const React = require("react");

const ChartContext = React.createContext({ data: [], width: 0, height: 0 });

function clamp(number, min, max) {
  return Math.min(Math.max(number, min), max);
}

function ResponsiveContainer(props) {
  const { width = "100%", height = "100%", children } = props;
  const containerRef = React.useRef(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const measure = () => {
      setSize({ width: node.clientWidth || 0, height: node.clientHeight || 0 });
    };

    measure();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          const { width: w, height: h } = entry.contentRect;
          setSize({ width: w, height: h });
        }
      });
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const style = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  return React.createElement(
    "div",
    {
      ref: containerRef,
      style,
      className: "recharts-responsive-container",
    },
    size.width > 0 && size.height > 0
      ? React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) {
            return child;
          }
          return React.cloneElement(child, {
            width: size.width,
            height: size.height,
          });
        })
      : null
  );
}

function ChartShell(props) {
  const { data = [], width = 0, height = 0, children, role = "img", "aria-label": ariaLabel } = props;
  const normalizedWidth = Math.max(1, Math.floor(width));
  const normalizedHeight = Math.max(1, Math.floor(height));
  const contextValue = React.useMemo(
    () => ({ data, width: normalizedWidth, height: normalizedHeight }),
    [data, normalizedWidth, normalizedHeight]
  );

  return React.createElement(
    ChartContext.Provider,
    { value: contextValue },
    React.createElement(
      "svg",
      {
        width: "100%",
        height: "100%",
        viewBox: `0 0 ${normalizedWidth} ${normalizedHeight}`,
        preserveAspectRatio: "none",
        role,
        "aria-label": ariaLabel,
      },
      React.Children.map(children, (child, index) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { key: child.key ?? index })
          : child
      )
    )
  );
}

function LineChart(props) {
  return ChartShell(props);
}

function AreaChart(props) {
  return ChartShell(props);
}

function BarChart(props) {
  return ChartShell(props);
}

function useSeries(dataKey) {
  const { data, width, height } = React.useContext(ChartContext);

  if (!data || data.length === 0 || width === 0 || height === 0) {
    return { points: [], width, height };
  }

  const values = data.map((item) => {
    const raw = getValue(item, dataKey);
    const numeric = Number(raw);
    return Number.isFinite(numeric) ? numeric : 0;
  });

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = values.length > 1 ? width / (values.length - 1) : 0;

  const points = values.map((value, index) => {
    const x = values.length > 1 ? step * index : width / 2;
    const pct = range === 0 ? 0.5 : clamp((value - min) / range, 0, 1);
    const y = height - pct * height;
    return { x, y, value };
  });

  return { points, width, height, min, max };
}

function getValue(dataPoint, dataKey) {
  if (dataKey == null) {
    return dataPoint;
  }
  if (typeof dataPoint !== "object" || dataPoint === null) {
    return undefined;
  }
  return dataPoint[dataKey];
}

function Line(props) {
  const { dataKey, stroke = "currentColor", strokeWidth = 2, dot = false } = props;
  const { points } = useSeries(dataKey);

  if (points.length === 0) {
    return null;
  }

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");

  return React.createElement(
    React.Fragment,
    null,
    React.createElement("path", {
      d: path,
      fill: "none",
      stroke,
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round",
    }),
    dot
      ? points.map((point, index) =>
          React.createElement("circle", {
            key: index,
            cx: point.x,
            cy: point.y,
            r: 2,
            fill: stroke,
          })
        )
      : null
  );
}

function Area(props) {
  const {
    dataKey,
    stroke = "currentColor",
    strokeWidth = 2,
    fill = "currentColor",
    fillOpacity = 0.1,
  } = props;
  const { points, height } = useSeries(dataKey);

  if (points.length === 0) {
    return null;
  }

  const pathCommands = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
  const last = points[points.length - 1];
  const first = points[0];
  const areaPath = `${pathCommands} L${last.x.toFixed(2)} ${height.toFixed(2)} L${first.x.toFixed(2)} ${height.toFixed(
    2
  )} Z`;

  return React.createElement(
    React.Fragment,
    null,
    React.createElement("path", {
      d: pathCommands,
      fill: "none",
      stroke,
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round",
    }),
    React.createElement("path", {
      d: areaPath,
      fill,
      fillOpacity,
      stroke: "none",
    })
  );
}

function Bar(props) {
  const { dataKey, fill = "currentColor" } = props;
  const { data, width, height } = React.useContext(ChartContext);

  if (!data || data.length === 0 || width === 0 || height === 0) {
    return null;
  }

  const values = data.map((item) => {
    const raw = getValue(item, dataKey);
    const numeric = Number(raw);
    return Number.isFinite(numeric) ? numeric : 0;
  });

  const maxValue = Math.max(...values, 0);
  const positiveMax = maxValue > 0 ? maxValue : 1;
  const step = width / Math.max(values.length, 1);
  const gapRatio = 0.3;
  const barWidth = Math.max(1, step * (1 - gapRatio));

  return React.createElement(
    React.Fragment,
    null,
    values.map((value, index) => {
      const normalized = Math.max(0, value) / positiveMax;
      const barHeight = normalized * height;
      const x = step * index + (step - barWidth) / 2;
      const y = height - barHeight;

      return React.createElement("rect", {
        key: index,
        x,
        y,
        width: barWidth,
        height: barHeight,
        fill,
        rx: 2,
        ry: 2,
      });
    })
  );
}

function AxisLabel({ x, y, textAnchor = "middle", value, fontSize = 10, opacity = 0.6 }) {
  return React.createElement("text", {
    x,
    y,
    textAnchor,
    fontSize,
    fill: "currentColor",
    opacity,
  }, value);
}

function XAxis({ dataKey, tickLine = true, axisLine = true }) {
  const { data, width, height } = React.useContext(ChartContext);
  if (!data || data.length === 0) {
    return null;
  }
  const step = data.length > 1 ? width / (data.length - 1) : 0;
  const ticks = data.map((item, index) => ({
    x: data.length > 1 ? step * index : width / 2,
    label: getValue(item, dataKey),
  }));

  return React.createElement(
    React.Fragment,
    null,
    axisLine
      ? React.createElement("line", {
          x1: 0,
          y1: height,
          x2: width,
          y2: height,
          stroke: "currentColor",
          strokeOpacity: 0.1,
        })
      : null,
    ticks.map((tick, index) =>
      React.createElement(
        React.Fragment,
        { key: index },
        tickLine
          ? React.createElement("line", {
              x1: tick.x,
              y1: height,
              x2: tick.x,
              y2: height - 4,
              stroke: "currentColor",
              strokeOpacity: 0.1,
            })
          : null,
        React.createElement(AxisLabel, {
          x: tick.x,
          y: height + 12,
          value: tick.label,
        })
      )
    )
  );
}

function YAxis({ tickLine = true, axisLine = true, ticks = 4, tickFormatter }) {
  const { height } = React.useContext(ChartContext);
  if (height === 0) {
    return null;
  }
  const sections = Math.max(1, ticks);
  const step = height / sections;
  const values = Array.from({ length: sections + 1 }, (_, index) => ({
    y: height - step * index,
    label: tickFormatter ? tickFormatter(index) : index,
  }));

  return React.createElement(
    React.Fragment,
    null,
    axisLine
      ? React.createElement("line", {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: height,
          stroke: "currentColor",
          strokeOpacity: 0.1,
        })
      : null,
    values.map((tick, index) =>
      React.createElement(
        React.Fragment,
        { key: index },
        tickLine
          ? React.createElement("line", {
              x1: 0,
              y1: tick.y,
              x2: 4,
              y2: tick.y,
              stroke: "currentColor",
              strokeOpacity: 0.1,
            })
          : null,
        React.createElement(AxisLabel, {
          x: -6,
          y: tick.y + 3,
          textAnchor: "end",
          value: tick.label,
        })
      )
    )
  );
}

function CartesianGrid({ vertical = true, horizontal = true, strokeOpacity = 0.05 }) {
  const { width, height } = React.useContext(ChartContext);
  const lines = [];

  if (horizontal) {
    const rows = 4;
    for (let i = 1; i < rows; i += 1) {
      const y = (height / rows) * i;
      lines.push(
        React.createElement("line", {
          key: `h-${i}`,
          x1: 0,
          y1: y,
          x2: width,
          y2: y,
          stroke: "currentColor",
          strokeOpacity,
        })
      );
    }
  }

  if (vertical) {
    const cols = 4;
    for (let i = 1; i < cols; i += 1) {
      const x = (width / cols) * i;
      lines.push(
        React.createElement("line", {
          key: `v-${i}`,
          x1: x,
          y1: 0,
          x2: x,
          y2: height,
          stroke: "currentColor",
          strokeOpacity,
        })
      );
    }
  }

  return React.createElement(React.Fragment, null, lines);
}

function Tooltip() {
  return null;
}

module.exports = {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
};
