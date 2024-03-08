import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import DisplayArea from "./components/DisplayArea";
import MenuToolbar from "./components/MenuToolbar";
import AnnotationProvider from "./components/AnnotationContext";
import MemoryProvider from "./components/MemoryContext";
import ModeProvider from "./components/ModeContext";

import Stack from "@mui/material/Stack";
import Item from "@mui/material/ListItem";
import MyTheme from "./components/Theme";
import { DebugTheme } from "./components/Theme";

import DictionaryPage from "./components/DictionaryPage";

const theme = createTheme(MyTheme);
// const theme = createTheme(DebugTheme);

const App = () => {
  return (
    <ThemeProvider theme={theme}>
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
            {/* <DictionaryPage/> */}
          </ModeProvider>
        </MemoryProvider>
      </AnnotationProvider>
    </ThemeProvider>
  );
};

export default App;
