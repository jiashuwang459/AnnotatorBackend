import React, { Component } from "react";
import { render } from "react-dom";
import Home from "./Home";

export default class App extends Component {
  constructor(props) {
    super(props);
    // this.state = {};
  }

  render() {
    return <Home />;
  }
}

const appDiv = document.getElementById("app");
render(<App name="Jiashu" />, appDiv);
