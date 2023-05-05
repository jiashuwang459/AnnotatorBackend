import React, { useEffect } from "react";
import Tooltip from "react-bootstrap/Tooltip";

export const UpdatingTooltip = React.forwardRef(
    ({ popper, children, show: _, ...props }, ref) => {
      useEffect(() => {
        console.log("updating!");
        popper.scheduleUpdate();
      }, [children, popper]);
  
      return (
        <Tooltip ref={ref} {...props}>
          {children}
        </Tooltip>
      );
    }
  );