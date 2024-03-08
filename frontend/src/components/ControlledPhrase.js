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
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Item from "@mui/material/ListItem";
import Divider from '@mui/material/Divider';

// march 8. 2024 TODO:
// Using a stack isn't bad, but probably go back to what we had before, and use a card. See HelperCard.js.


function ControlledPhrase(props) {
  const phrase = props.phrase;

  return (
    <Popover>
      <PopoverTrigger asChild={true}>
        <Phrase phrase={phrase} {...props} />
      </PopoverTrigger>
      <PopoverContent>
        <Stack sx={{ height: "100%", backgroundColor: "transparent", }}>
          <Item>
            <Paper>
              {phrase.cchars
                ? phrase.cchars.map((fchar) => {
                    return fchar.cchar == "\n" ? "" : fchar.cchar;
                  })
                : "Nothing"}
            </Paper>
          </Item>
          <Divider/>
          <Item sx={{ height: "100%" }}>
            <Paper>Body</Paper>
          </Item>
        </Stack>
      </PopoverContent>
    </Popover>
  );
}

export default ControlledPhrase;
