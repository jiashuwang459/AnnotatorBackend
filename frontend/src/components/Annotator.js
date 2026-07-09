import React, { useState } from "react";
import DisplayArea from "./DisplayArea";
import MenuToolbar from "./MenuToolbar";
import AnnotationProvider from "./AnnotationContext";
import MemoryProvider from "./MemoryContext";
import ModeProvider from "./ModeContext";

import Stack from "@mui/material/Stack";
import Item from "@mui/material/ListItem";

const Annotator = () => {
  return (
    <AnnotationProvider>
      <MemoryProvider>
        <ModeProvider>
          <Stack sx={{ height: "100%", backgroundColor: "white" }}>
            <Item>
              <MenuToolbar></MenuToolbar>
            </Item>
            <Item sx={{ height: "100%" }}>
              <DisplayArea></DisplayArea>
            </Item>
          </Stack>
        </ModeProvider>
      </MemoryProvider>
    </AnnotationProvider>
  );
};

export default Annotator;
