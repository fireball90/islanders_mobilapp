import React, { useEffect } from "react";
import { Popover } from "react-bootstrap";
import "./MovablePopover.css";

const MovablePopover = React.forwardRef(
  ({ popper, children, show: _, ...props }, ref) => {
    useEffect(() => {
      popper.scheduleUpdate();
    }, [props.zoom, popper]);

    return (
      <Popover ref={ref} body {...props} className="border-0 rounded-0">
        <div className="bg-pop font-btn">{children}</div>
      </Popover>
    );
  }
);

export default MovablePopover;