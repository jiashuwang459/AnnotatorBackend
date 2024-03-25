import React, { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Annotator from "./components/Annotator";
import DictionaryPage from "./components/DictionaryPage";

import Stack from "@mui/material/Stack";
import Item from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import MyTheme from "./components/Theme";
import { DebugTheme } from "./components/Theme";

const theme = createTheme(MyTheme);
// const theme = createTheme(DebugTheme);

//TODO: perhaps look into this for loading buttons? https://mui.com/material-ui/react-button/#loading-button

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route exact path="/">
            <Stack direction="column" spacing={2}>
              <Item>
                <Paper sx={{ width: "100%", textAlign: "center" }}>
                  This is home
                </Paper>
              </Item>
              <Item sx={{ width: "100%", textAlign: "center" }}>
                <Link to="/annotator" style={{ width: "100%" }}>
                  <Button variant="contained" sx={{ width: "100%" }}>
                    Go to Annotator Page
                  </Button>
                </Link>
              </Item>
              <Item sx={{ width: "100%", textAlign: "center" }}>
                <Link to="/dictionary" style={{ width: "100%" }}>
                  <Button variant="contained" sx={{ width: "100%" }}>
                    Go to Dictionary
                  </Button>
                </Link>
              </Item>
            </Stack>
          </Route>
          <Route exact path="/annotator" component={Annotator}></Route>
          <Route exact path="/dictionary" component={DictionaryPage}></Route>
        </Switch>
      </Router>
    </ThemeProvider>
  );
};

export default App;
