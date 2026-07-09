import React, { Component } from "react";
import { render } from "react-dom";
import Home from "./Home";
import {
  ThemeProvider,
  StyledEngineProvider,
  createTheme,
  adaptV4Theme,
} from "@mui/material/styles";

// const useStyles = makeStyles((theme) => {

//   root: {
//     // some CSS that access to theme
//   }
// });
import axios from "axios";
import { flexbox } from "@mui/system";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

const defaultTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: '#fdf5e6',
    },
    secondary: {
      main: '#8add5d',
    },
    background: {
      paper: '#fdf5e6',
    },
  }
});

let theme = createTheme({
  palette: defaultTheme.palette,
  components: {
    MuiPaper: {
      variants: [
        {
          props: { variant: "newline" },
          style: {
            // textTransform: "none",
            // border: `2px dashed ${blue[500]}`,
            margin: "4px",
          },
        },
        {
          props: { variant: "character" },
          style: {
            // textTransform: "none",
            // border: `2px dashed ${blue[500]}`,
            margin: "2px",
            backgroundColor: "transparent",
          },
        },
        {
          props: { variant: "annotation" },
          style: {
            // textTransform: "none",
            // border: `2px dashed ${blue[500]}`,
            textAlign: "center",
            fontSize: "small",
            backgroundColor: "transparent",
          },
        },
        {
          props: { variant: "cchar" },
          style: {
            // alignItems: "center",
            textAlign: "center",
            fontSize: "x-large",
            backgroundColor: "transparent",
          },
        },
        {
          props: { variant: "phrase" },
          style: {
            // textTransform: "none",
            // border: `2px dashed ${blue[500]}`,
            margin: "2px",
            gap: "4px",
            display: "flex",
            flexDiration: "row",
          },
        },
        {
          props: { variant: "phrase_outline" },
          style: {
            // textTransform: "none",
            border: `1px dashed ${defaultTheme.palette.secondary.light}`,
            backgroundColor: "aliceblue",
            margin: "1px",
            // color: defaultTheme.palette.secondary.main,
            gap: "4px",
            display: "flex",
            flexDiration: "row",
          },
        },
      ],
    },
  },
});

// const theme = createMuiTheme();
//

export default class App extends Component {
  constructor(props) {
    super(props);
    // this.state = {};
  }

  render() {
    return (
      <React.StrictMode>
        <ThemeProvider theme={theme}>
          <Home id="home" {...this.props} />
        </ThemeProvider>
      </React.StrictMode>
    );
  }
}

const appDiv = document.getElementById("app");
render(<App name="Jiashu" />, appDiv);
