import React, { Component } from "react";
// import styled from "styled-components";
import { InputForm } from "./InputForm";
import { DisplayArea } from "./DisplayArea";
import { MdEdit } from "react-icons/md";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import {
  TextareaAutosize,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
  FormControlLabel,
  Grid,
  FormLabel,
  Input,
} from "@material-ui/core";
// import { TextArea } from "semantic-ui-react";
import styled from "styled-components";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";

// const Container = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   padding: 20px;
//   position: relative;
//   width: 100%;
//   height: 100%;
// `;

// const TextArea = styled(TextareaAutosize)({
//   resize: "vertical",
//   flex: "auto",
//   width: "100%",
// });

const Display = styled.div`
  display: flex;
  width: 100%;
  padding: 10px;
  flex-direction: row;
  flex-wrap: wrap;
  border: crimson;
  border-style: dashed;
  border-width: thin;
  text-align: left;
`;

const TextArea = styled.textarea`
  resize: vertical;
  flex: auto;
  overflow-y: auto;
  min-height: 100px;
  max-height: 200px;
`;
const MemoryInput = styled.input``;

const NBSP = "\u00a0";

export class Annotation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: this.props.text ? this.props.text : "",
      loading: false,
    };

    this.handleAnnotateButtonClick = this.handleAnnotateButtonClick.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
  }

  handleTextChange(e) {
    this.setState(
      {
        text: e.target.value,
      }
      // () => {
      //   console.log(this.state);
      // }
    );
  }

  handleAnnotateButtonClick(e) {
    console.log("annotate button clicked");
    console.log(e);
    console.log(this.state);
    if (this.state.loading) {
      console.log("Already loading.");
      return;
    }
    this.setState(
      {
        loading: true,
      }
      // () => {
      //   console.log(this.state);
      // }
    );

    this.props.onAnnotate(this.state.text);
    this.setState({
      loading: false,
    });
  }

  componentWillUnmount() {
    this.props.onClose(this.state.text);
  }

  render() {
    return (
      <Grid container direction="column" style={{ height: "auto" }}>
        <Grid item align="center" style={{ margin: "5px" }}>
          <Display>
            <p> TODO: Add instructions on how to use this page here.</p>{" "}
            <p>
              This is the manual entry page, where you can paste in a section of
              chinese text and we will annotate pinyin onto them! Simply paste
              your text into the Textbox below and press annotate to get
              started!
            </p>
          </Display>
        </Grid>
        <Grid container style={{ height: "auto", margin: "5px" }}>
          <Grid item xs={9} align="center" style={{ maxHeight: "200px" }}>
            <FormControl
              component="fieldset"
              style={{
                padding: "5px",
                width: "90%",
                maxHeight: "100%",
              }}
            >
              <TextArea
                value={this.state.text}
                onChange={this.handleTextChange}
              />
              <FormHelperText style={{ alignSelf: "center" }}>
                Manual Text
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={3} align="center" style={{ padding: "5px" }}>
            {this.state.loading ? (
              <Button
                variant="primary"
                onClick={(e) => {
                  this.handleAnnotateButtonClick(e);
                }}
                className="me-2"
                disabled
              >
                <Spinner
                  as="span"
                  animation="border"
                  role="status"
                  size="sm"
                  aria-hidden="true"
                >
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={(e) => {
                  this.handleAnnotateButtonClick(e);
                }}
                className="me-2"
              >
                Annotate
              </Button>
            )}
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
