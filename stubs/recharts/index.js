const React = require('react');

const createStubComponent = (name) => {
  const Component = React.forwardRef((props = {}, ref) => {
    const { children, className, style, ...rest } = props;
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`recharts stub: rendering ${name}.`);
    }

    return React.createElement(
      'div',
      {
        ref,
        'data-recharts-stub': name,
        className,
        style: Object.assign({ width: '100%', height: '100%' }, style || {}),
        ...rest,
      },
      children
    );
  });

  Component.displayName = name;
  return Component;
};

const passthrough = (name) => {
  const Component = (props = {}) => {
    const { children, ...rest } = props;
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`recharts stub: rendering ${name}.`);
    }
    return React.createElement(React.Fragment, rest, children);
  };
  Component.displayName = name;
  return Component;
};

const ResponsiveContainer = (props = {}) => {
  const { children, width = '100%', height = '100%', className, style, ...rest } = props;
  if (process.env.NODE_ENV !== 'production') {
    console.warn('recharts stub: rendering ResponsiveContainer.');
  }

  const content =
    typeof children === 'function' ? children({ width, height }) : children;

  return React.createElement(
    'div',
    {
      'data-recharts-stub': 'ResponsiveContainer',
      className,
      style: Object.assign({ width, height, position: 'relative' }, style || {}),
      ...rest,
    },
    content
  );
};

const stub = {
  ResponsiveContainer,
  LineChart: createStubComponent('LineChart'),
  BarChart: createStubComponent('BarChart'),
  AreaChart: createStubComponent('AreaChart'),
  PieChart: createStubComponent('PieChart'),
  ComposedChart: createStubComponent('ComposedChart'),
  RadarChart: createStubComponent('RadarChart'),
  Line: passthrough('Line'),
  Bar: passthrough('Bar'),
  Area: passthrough('Area'),
  Pie: passthrough('Pie'),
  Cell: passthrough('Cell'),
  Radar: passthrough('Radar'),
  XAxis: createStubComponent('XAxis'),
  YAxis: createStubComponent('YAxis'),
  ZAxis: createStubComponent('ZAxis'),
  PolarAngleAxis: createStubComponent('PolarAngleAxis'),
  PolarRadiusAxis: createStubComponent('PolarRadiusAxis'),
  CartesianGrid: createStubComponent('CartesianGrid'),
  Tooltip: createStubComponent('Tooltip'),
  Legend: createStubComponent('Legend'),
  ReferenceLine: createStubComponent('ReferenceLine'),
  ReferenceArea: createStubComponent('ReferenceArea'),
  ReferenceDot: createStubComponent('ReferenceDot'),
  Brush: createStubComponent('Brush'),
  ScatterChart: createStubComponent('ScatterChart'),
  Scatter: passthrough('Scatter'),
  RadialBarChart: createStubComponent('RadialBarChart'),
  RadialBar: passthrough('RadialBar'),
  Treemap: createStubComponent('Treemap'),
  FunnelChart: createStubComponent('FunnelChart'),
  Funnel: passthrough('Funnel'),
  Sankey: createStubComponent('Sankey'),
  ErrorBar: createStubComponent('ErrorBar'),
  TooltipWrapper: createStubComponent('TooltipWrapper'),
  Surface: createStubComponent('Surface'),
  Customized: passthrough('Customized'),
};

module.exports = stub;
module.exports.default = stub;
