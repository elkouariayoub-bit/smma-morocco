const React = require("react");

const TabsContext = React.createContext(null);

function Root({ value: controlledValue, defaultValue, onValueChange, children, orientation = "horizontal" }) {
  const [value, setValue] = React.useState(controlledValue ?? defaultValue ?? null);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : value;

  const setCurrent = React.useCallback(
    (next) => {
      if (!isControlled) setValue(next);
      if (onValueChange) onValueChange(next);
    },
    [isControlled, onValueChange]
  );

  const contextValue = React.useMemo(
    () => ({ value: currentValue, setValue: setCurrent, orientation }),
    [currentValue, setCurrent, orientation]
  );

  return React.createElement(TabsContext.Provider, { value: contextValue }, children);
}

function List({ children, className = "", ...props }, ref) {
  return React.createElement(
    "div",
    {
      role: "tablist",
      className,
      ref,
      ...props,
    },
    children
  );
}

const ForwardedList = React.forwardRef(List);

function Trigger({ value, children, className = "", ...props }, ref) {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs.Trigger must be used within Tabs.Root");
  }
  const { value: currentValue, setValue } = context;
  const selected = currentValue === value;

  return React.createElement(
    "button",
    {
      role: "tab",
      type: "button",
      "aria-selected": selected,
      "data-state": selected ? "active" : "inactive",
      className,
      onClick: () => setValue(value),
      ref,
      ...props,
    },
    children
  );
}

const ForwardedTrigger = React.forwardRef(Trigger);

function Content({ value, children, className = "", ...props }, ref) {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs.Content must be used within Tabs.Root");
  }
  const { value: currentValue } = context;
  const hidden = currentValue !== value;

  return hidden
    ? null
    : React.createElement(
        "div",
        {
          role: "tabpanel",
          className,
          ref,
          ...props,
        },
        children
      );
}

const ForwardedContent = React.forwardRef(Content);

module.exports = {
  Root,
  List: ForwardedList,
  Trigger: ForwardedTrigger,
  Content: ForwardedContent,
};
