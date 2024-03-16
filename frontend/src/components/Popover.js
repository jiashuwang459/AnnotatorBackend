import * as React from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  useMergeRefs,
  Placement,
  FloatingPortal,
  FloatingFocusManager,
  useId,
  arrow,
  FloatingArrow,
} from "@floating-ui/react";
import Paper from "@mui/material/Paper";

// interface PopoverOptions {
//   initialOpen?: boolean;
//   placement?: Placement;
//   modal?: boolean;
//   open?: boolean;
//   onOpenChange?: (open: boolean) => void;
// }

export function usePopover({
  initialOpen = false,
  placement = "bottom",
  modal,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);
  const [labelId, setLabelId] = React.useState();
  const [descriptionId, setDescriptionId] = React.useState();

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const arrowRef = React.useRef(null);

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(5),
      flip({
        crossAxis: placement.includes("-"),
        fallbackAxisSideDirection: "end",
        padding: 5,
      }),
      shift({ padding: 5 }),
      arrow({ element: arrowRef }),
    ],
  });

  const context = data.context;

  const click = useClick(context, {
    enabled: controlledOpen == null,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const interactions = useInteractions([click, dismiss, role]);

  return React.useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
      modal,
      arrowRef,
      labelId,
      descriptionId,
      setLabelId,
      setDescriptionId,
    }),
    [open, setOpen, interactions, data, modal, arrowRef, labelId, descriptionId]
  );
}

// type ContextType =
//   | (ReturnType<typeof usePopover> & {
//       setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
//       setDescriptionId: React.Dispatch<
//         React.SetStateAction<string | undefined>
//       >;
//     })
//   | null;

const PopoverContext = React.createContext(null);

export const usePopoverContext = () => {
  const context = React.useContext(PopoverContext);

  if (context == null) {
    throw new Error("Popover components must be wrapped in <Popover />");
  }

  return context;
};

export function Popover({ children, modal = false, ...restOptions }) {
  // const arrowRef = React.useRef(null);
  // This can accept any props as options, e.g. `placement`,
  // or other positioning options.
  const popover = usePopover({ modal, ...restOptions });
  // const context = usePopoverContext();
  return (
    <PopoverContext.Provider value={popover}>
      {children}
    </PopoverContext.Provider>
  );
}

export const PopoverTrigger = React.forwardRef(function PopoverTrigger(
  { children, asChild = false, ...props },
  propRef
) {
  const context = usePopoverContext();
  const childrenRef = children.ref;
  const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

  // `asChild` allows the user to pass any element as the anchor
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children,
      context.getReferenceProps({
        ref,
        ...props,
        ...children.props,
        "data-state": context.open ? "open" : "closed",
      })
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      // The user can style the trigger based on the state
      data-state={context.open ? "open" : "closed"}
      {...context.getReferenceProps(props)}
    >
      {children}
    </button>
  );
});

export const PopoverContent = React.forwardRef(function PopoverContent(
  { style, ...props },
  propRef
) {
  const { context: floatingContext, ...context } = usePopoverContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  if (!floatingContext.open) return null;

  return (
    <FloatingPortal>
      <FloatingFocusManager context={floatingContext} modal={context.modal}>
        <Paper
          variant="popover"
          ref={ref}
          style={{ ...context.floatingStyles, ...style }}
          aria-labelledby={context.labelId}
          aria-describedby={context.descriptionId}
          {...context.getFloatingProps(props)}
        >
          {props.children}
          <FloatingArrow ref={context.arrowRef} context={context} />
        </Paper>
      </FloatingFocusManager>
    </FloatingPortal>
  );
});

// export const PopoverArrow = React.forwardRef(function PopoverContent({ style, ...props }, ref) {
//   const { context: floatingContext, ...context } = usePopoverContext();
//   // const ref = propRef;

//   // if (!floatingContext.open) return null;

//   return (
//   );
// });

// export const PopoverHeading = React.forwardRef(function PopoverHeading(props, ref) {
//   const { setLabelId } = usePopoverContext();
//   const id = useId();

//   // Only sets `aria-labelledby` on the Popover root element
//   // if this component is mounted inside it.
//   React.useLayoutEffect(() => {
//     setLabelId(id);
//     return () => setLabelId(undefined);
//   }, [id, setLabelId]);

//   return (
//     <h2 {...props} ref={ref} id={id}>
//       {props.children}
//     </h2>
//   );
// });

// export const PopoverDescription = React.forwardRef(function PopoverDescription(props, ref) {
//   const { setDescriptionId } = usePopoverContext();
//   const id = useId();

//   // Only sets `aria-describedby` on the Popover root element
//   // if this component is mounted inside it.
//   React.useLayoutEffect(() => {
//     setDescriptionId(id);
//     return () => setDescriptionId(undefined);
//   }, [id, setDescriptionId]);

//   return <p {...props} ref={ref} id={id} />;
// });

// export const PopoverClose = React.forwardRef(function PopoverClose(props, ref) {
//   const { setOpen } = usePopoverContext();
//   return (
//     <button
//       type="button"
//       ref={ref}
//       {...props}
//       onClick={(event) => {
//         props.onClick?.(event);
//         setOpen(false);
//       }}
//     />
//   );
// });
