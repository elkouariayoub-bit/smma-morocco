const React = require("react");

function createComponent(name, defaultTag = "div") {
  const Component = React.forwardRef(function Component(props, ref) {
    const { children, ...rest } = props;
    return React.createElement(
      defaultTag,
      { "data-recharts": name, ref, ...rest },
      children
    );
  });
  Component.displayName = name;
  return Component;
}

const ResponsiveContainer = ({ width = "100%", height = "100%", children }) => {
  return React.createElement(
    "div",
    {
      style: {
        position: "relative",
        width,
        height,
      },
      "data-recharts": "ResponsiveContainer",
    },
    children
  );
};

const LineChart = createComponent("LineChart");
const Line = createComponent("Line");
const Tooltip = () => null;
const YAxis = createComponent("YAxis", "span");
const XAxis = createComponent("XAxis", "span");
const CartesianGrid = createComponent("CartesianGrid");

module.exports = {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  YAxis,
  XAxis,
  CartesianGrid,
};
