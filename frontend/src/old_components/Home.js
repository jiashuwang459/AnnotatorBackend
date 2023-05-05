import React, { Component } from "react";
import styled from "styled-components";
import { DisplayArea } from "./DisplayArea";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import ManualPage from "./ManualPage";
import DictionaryPage from "./DictionaryPage";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  width: 100%;
  height: 100%;
`;

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.display = {};
    this.input = {};
    
    // this.state = {};
  }

  triggerAnnotate = () => {
    console.log("triggerAnnotate");
    console.log(this.input.state);
    // axios.post("/annotate", this.input.state).then((res) => {
    //   console.log(res);
    //   if (res.data["message"]) {
    //     console.log("test");
    //   } else if (res.data["annotated"]) {
    //     this.display.updateDisplay(res.data["annotated"]);
    //   }
    // });
  };
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/">
            <div><p> This is home</p></div>
            <Link to="/manual"><button>
              Go to Manual Page (This is probably the one you want to click)
            </button>
            </Link>
            <Link to="/dictionary"><button>
              Go to Dictionary
            </button>
            </Link>
          </Route>
          <Route exact path="/manual" component={ManualPage}></Route>
          <Route exact path="/dictionary" component={DictionaryPage}></Route>
        </Switch>
      </Router>
    );
  }
}
