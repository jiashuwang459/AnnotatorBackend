import React, { useState } from "react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverDescription,
  PopoverHeading,
  PopoverClose,
} from "./Popover";
import Phrase from "./Phrase";

function ControlledPhrase(props) {
  const [open, setOpen] = useState(false);
  const phrase = props.phrase;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild={true} onClick={() => setOpen((v) => !v)}>
        <Phrase phrase={phrase} {...props}/>
      </PopoverTrigger>
      <PopoverContent className="Popover">
        <PopoverHeading>My popover heading</PopoverHeading>
        <PopoverDescription>My popover description</PopoverDescription>
        <PopoverClose>Close</PopoverClose>
      </PopoverContent>
    </Popover>
  );
}

export default ControlledPhrase;
