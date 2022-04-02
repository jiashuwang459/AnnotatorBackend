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
import axios from 'axios';

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

let theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#f50057",
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
