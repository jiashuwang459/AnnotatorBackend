import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import DisplayArea from "./components/DisplayArea";
import MenuToolbar from "./components/MenuToolbar";
import AnnotationProvider from "./components/AnnotationContext";

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
        <Stack sx={{ height: "100%", backgroundColor: "white" }}>
          <Item>
            <MenuToolbar></MenuToolbar>
          </Item>
          <Item sx={{ height: "100%" }}>
            <DisplayArea></DisplayArea>
          </Item>
        </Stack>
      </AnnotationProvider>
    </ThemeProvider>
  );
};

export default App;
