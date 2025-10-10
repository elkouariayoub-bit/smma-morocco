const React = require("react");

const PopoverContext = React.createContext(null);

function Root({ children, open, defaultOpen, onOpenChange }) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;

  const setOpen = React.useCallback(
    (value) => {
      const next = Boolean(value);
      if (!isControlled) {
        setInternalOpen(next);
      }
      if (onOpenChange) onOpenChange(next);
    },
    [isControlled, onOpenChange]
  );

  const toggle = React.useCallback(() => {
    setOpen(!currentOpen);
  }, [currentOpen, setOpen]);

  const contextValue = React.useMemo(
    () => ({ open: currentOpen, setOpen, toggle }),
    [currentOpen, setOpen, toggle]
  );

  return React.createElement(
    PopoverContext.Provider,
    { value: contextValue },
    children
  );
}

function Trigger({ children, asChild, ...props }, ref) {
  const { toggle } = usePopover();
  const handleClick = (event) => {
    if (children && typeof children.props?.onClick === "function") {
      children.props.onClick(event);
    }
    if (!event.defaultPrevented) {
      toggle();
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick: handleClick, ref, ...props });
  }

  return React.createElement(
    "button",
    { type: "button", onClick: handleClick, ref, ...props },
    children
  );
}

const ForwardedTrigger = React.forwardRef(Trigger);

const Portal = ({ children }) => React.createElement(React.Fragment, null, children);
const Anchor = ({ children }) => React.createElement(React.Fragment, null, children);

function Content({ children, className = "", ...props }, ref) {
  const { open, setOpen } = usePopover();

  React.useEffect(() => {
    if (!open) return;
    const handler = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  if (!open) return null;

  return React.createElement(
    "div",
    {
      ref,
      className,
      ...props,
    },
    children
  );
}

const ForwardedContent = React.forwardRef(Content);

function usePopover() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within <Popover.Root>");
  }
  return context;
}

module.exports = {
  Root,
  Trigger: ForwardedTrigger,
  Content: ForwardedContent,
  Portal,
  Anchor,
};
