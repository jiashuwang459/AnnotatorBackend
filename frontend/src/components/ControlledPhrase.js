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
import HelperCard from "./HelperCard";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Item from "@mui/material/ListItem";
import Divider from '@mui/material/Divider';

// march 14. 2024 TODO: add arrow!


function ControlledPhrase(props) {
  const phrase = props.phrase;

  return (
    <Popover>
      <PopoverTrigger asChild={true}>
        <Phrase phrase={phrase} {...props} />
      </PopoverTrigger>
      <PopoverContent>
        <HelperCard phrase={phrase} {...props}/>
      </PopoverContent>
    </Popover>
  );
}

export default ControlledPhrase;
