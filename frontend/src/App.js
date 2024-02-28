import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import DisplayArea from "./components/DisplayArea";
import MenuToolbar from "./components/MenuToolbar";
import AnnotationProvider from "./components/AnnotationContext";
import MemoryProvider from "./components/MemoryContext";

import Stack from "@mui/material/Stack";
import Item from "@mui/material/ListItem";
import MyTheme from "./components/Theme";
import { DebugTheme } from "./components/Theme";

// const theme = createTheme(MyTheme);
const theme = createTheme(DebugTheme);

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AnnotationProvider>
        <MemoryProvider>
          <Stack sx={{ height: "100%", backgroundColor: "white" }}>
            <Item>
              <MenuToolbar></MenuToolbar>
            </Item>
            <Item sx={{ height: "100%" }}>
              <DisplayArea></DisplayArea>
            </Item>
          </Stack>
        </MemoryProvider>
      </AnnotationProvider>
    </ThemeProvider>
  );
};

export default App;
