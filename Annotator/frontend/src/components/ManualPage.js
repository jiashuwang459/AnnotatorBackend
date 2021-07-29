import React, { Component } from "react";
// import styled from "styled-components";
import { InputForm } from "./InputForm";
import { DisplayArea } from "./DisplayArea";
import { Annotation } from "./Annotation";
import {
  MdEdit,
  MdFileDownload,
  MdFileUpload,
  MdSave,
  MdInfoOutline,
} from "react-icons/md";
import { FiBookOpen, FiDownload } from "react-icons/fi";
import { TiFolderOpen } from "react-icons/ti";
import { BsArrowBarRight } from "react-icons/bs";
import { GiArchiveResearch } from "react-icons/gi";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
// import Button from "@material-ui/core/Button";
// import Grid from "@material-ui/core/Grid";
// import Typography from "@material-ui/core/Typography";
// import TextField from "@material-ui/core/TextField";
import {
  TextareaAutosize,
  // FormControl,
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
import { makeStyles, responsiveFontSizes } from "@material-ui/core/styles";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Popover from "react-bootstrap/Popover";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Overlay from "react-bootstrap/Overlay";
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import FloatingLabel from "react-bootstrap/FloatingLabel";

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

const TextArea = styled.textarea`
  resize: vertical;
  flex: auto;
  overflow-y: auto;
  min-height: 50px;
  max-height: 150px;
`;
const MemoryInput = styled.input``;

const NBSP = "\u00a0";

export default class ManualPage extends Component {
  constructor(props) {
    super(props);
    this.display = {};
    this.annotation = {};
    this.fetchOverlay = {};
    // this.annotateButton = {};
    this.state = {
      text: "",
      code: 0,
      fetchCode: 0,
      loading: false,
      open: true,
      dictionaryMode: false,
    };

    // this.handleAnnotateButtonClick = this.handleAnnotateButtonClick.bind(this);
    // this.handleTextChange = this.handleTextChange.bind(this);
    this.handleMemoryCodeChange = this.handleMemoryCodeChange.bind(this);
    this.handleFetchMemoryButtonClick =
      this.handleFetchMemoryButtonClick.bind(this);
    this.handleSaveMemoryButtonClick =
      this.handleSaveMemoryButtonClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.handleAnnotate = this.handleAnnotate.bind(this);
    this.handleCloseAnnotation = this.handleCloseAnnotation.bind(this);
    this.handleHideFetchOverlay = this.handleHideFetchOverlay.bind(this);
    this.handleMemoryInfoButtonClick =
      this.handleMemoryInfoButtonClick.bind(this);
    // this.handleModeToggle = this.handleModeToggle.bind(this);
    this.handleDictionaryModeToggle =
      this.handleDictionaryModeToggle.bind(this);
  }

  // handleTextChange(e) {
  //   this.setState(
  //     {
  //       text: e.target.value,
  //     },
  //     () => {
  //       console.log(this.state);
  //     }
  //   );
  // }

  handleMemoryCodeChange(e) {
    this.setState(
      {
        fetchCode: e.target.value,
      }
      // () => {
      //   console.log(this.state);
      // }
    );
  }

  // handleAnnotateButtonClick(e) {
  //   console.log("annotate button clicked");
  //   console.log(e);
  //   console.log(this.state);
  //   if (this.state.loading) {
  //     console.log("Already loading.");
  //     return;
  //   }
  //   this.setState({
  //     loading: true,
  //   });

  //   const requestOptions = {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       text: this.state.text,
  //     }),
  //   };

  //   fetch("/api/annotate", requestOptions)
  //     .then((response) => {
  //       console.log(response.status); // Will show you the status
  //       if (!response.ok) {
  //         throw new Error("HTTP status " + response.status);
  //       }
  //       return response.json();
  //     })
  //     .then((data) => {
  //       console.log(data); //TODO： validation for all data
  //       this.display.updateDisplay(data);
  //     })
  //     .finally(() => {
  //       this.setState({
  //         loading: false,
  //       });
  //     });
  // }

  handleAnnotate(text) {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
      }),
    };

    this.setState(
      {
        loading: true,
        text: text,
        show: false,
      },
      () => {
        fetch("/api/annotate", requestOptions)
          .then((response) => {
            console.log(response.status);
            if (!response.ok) {
              throw new Error("HTTP status " + response.status);
            }
            return response.json();
          })
          .then((data) => {
            console.log(data); //TODO： validation for all data
            this.display.updateDisplay(data);
          })
          .finally(() => {
            this.setState({
              loading: false,
            });
          });
      }
    );
  }

  handleFetchMemoryButtonClick() {
    console.log("fetch button clicked");
    // console.log(this.state);
    // this.hideFetchPopover();
    this.handleHideFetchOverlay();

    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    var params = new URLSearchParams({
      code: this.state.fetchCode,
    });
    fetch("/api/memory/fetch?" + params.toString(), requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        this.setState(
          {
            code: data["code"],
          },
          () => {
            console.log(this.state);
          }
        );
        this.display.updateMemory(data["fragments"]);
      });
  }

  handleSaveMemoryButtonClick() {
    console.log("save button clicked");
    // console.log(this.state);

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fragments: this.display.getMemory(),
      }),
    };
    console.log(requestOptions);

    fetch("/api/memory/save", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        this.setState(
          {
            code: data["code"],
          },
          () => {
            console.log(this.state);
          }
        );
      });
  }

  handleShow() {
    console.log("show");
    this.setState(
      {
        show: true,
      }
      // () => console.log(this.state)
    );
  }

  handleClose() {
    console.log("close");
    this.setState(
      {
        show: false,
      }
      // () => console.log(this.state)
    );
  }

  handleCloseAnnotation(text) {
    console.log("closeAnnotation");
    this.setState(
      {
        text: text,
      }
      // () => console.log(this.state)
    );
  }

  handleHideFetchOverlay() {
    console.log("hideFetchOverlay");

    this.setState(
      {
        fetchOverlayShow: false,
      }
      // () => console.log(this.state)
    );
  }

  handleMemoryInfoButtonClick() {
    console.log("memoryInfo");
  }

  handleDictionaryModeToggle(e) {
    console.log("dictionary mode toggle");
    console.log(e);
    this.setState(
      {
        dictionaryMode: e.currentTarget.checked,
      },
      () => {
        // console.log(this.state);
        this.display.setDictMode(this.state.dictionaryMode);
      }
    );
  }

  render() {
    return (
      <Grid
        container
        spacing={1}
        alignItems="flex-start"
        style={{ padding: "10px", flexWrap: "nowrap" }}
        direction="column"
      >
        <Grid item>
          <ButtonToolbar
            className="justify-content-between"
            aria-label="Toolbar with Button groups"
            style={{ gap: "20px" }}
          >
            <InputGroup>
              <InputGroup.Text>
                Current{NBSP}Memory{NBSP}Code:
              </InputGroup.Text>
              <FormControl
                type="number"
                min="0"
                value={this.state.code}
                onChange={this.handleMemoryCodeChange}
                readOnly
                style={{ width: "100px" }}
              />

              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id={`tooltip-mem-load-button`}>
                    Load Memory Code
                  </Tooltip>
                }
              >
                <Button
                  variant="outline-secondary"
                  onClick={() => this.setState({ fetchOverlayShow: true })}
                  ref={(b) => {
                    this.fetchButton = b;
                  }}
                >
                  <TiFolderOpen />
                </Button>
              </OverlayTrigger>
              <Overlay
                placement="bottom"
                show={this.state.fetchOverlayShow}
                target={ReactDOM.findDOMNode(this.fetchButton)}
                onHide={this.handleHideFetchOverlay}
                rootClose
              >
                <Popover>
                  <Popover.Header>Load Memory Code</Popover.Header>
                  <Popover.Body>
                    <InputGroup>
                      <InputGroup.Text>Code:</InputGroup.Text>
                      <FormControl
                        type="number"
                        min={0}
                        value={this.state.fetchCode}
                        onChange={this.handleMemoryCodeChange}
                        style={{ textAlign: "center", width: "100px" }}
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={this.handleFetchMemoryButtonClick}
                      >
                        <BsArrowBarRight></BsArrowBarRight>
                      </Button>
                    </InputGroup>
                  </Popover.Body>
                </Popover>
              </Overlay>
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id={`tooltip-mem-save-button`}>
                    Save Current Memory
                  </Tooltip>
                }
              >
                <Button
                  variant="outline-secondary"
                  onClick={this.handleSaveMemoryButtonClick}
                >
                  <MdSave />
                </Button>
              </OverlayTrigger>
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id={`tooltip-mem-info-button`}>
                    Info on Memory Codes
                  </Tooltip>
                }
              >
                <Button
                  variant="outline-secondary"
                  onClick={this.handleMemoryInfoButtonClick}
                >
                  <MdInfoOutline />
                </Button>
              </OverlayTrigger>
            </InputGroup>

            <Offcanvas
              show={this.state.show}
              onHide={this.handleClose}
              placement="top"
              style={{ height: "fit-content", padding: "0px 10px 10px 10px" }}
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title style={{ marginInline: "auto" }}>
                  Manual Page
                </Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Grid container style={{ padding: "0px", margin: "0px" }}>
                  <Annotation
                    ref={(a) => (this.annotation = a)}
                    onAnnotate={this.handleAnnotate}
                    onClose={this.handleCloseAnnotation}
                    text={this.state.text}
                  />
                  {/* <Grid
                    container
                    justifyContent="center"
                    alignItems="center"
                    style={{ height: "auto" }}
                  >
                    <Grid item align="center">
                      <TextField
                        required={true}
                        type="integer"
                        onChange={this.handleMemoryCodeChange}
                        value={this.state.fetchCode}
                        inputProps={{
                          style: { textAlign: "center" },
                        }}
                      />
                    </Grid>
                    <Grid item xs={2} align="center" style={{ padding: "5px" }}>
                      <Button
                        variant="primary"
                        onClick={(e) => {
                          // this.disabled = true;
                          this.handleFetchMemoryButtonClick(this, e);
                        }}
                      >
                        Fetch
                      </Button>
                    </Grid>
                    <Grid item xs={2} align="center" style={{ padding: "5px" }}>
                      <Button
                        variant="primary"
                        onClick={this.handleSaveMemoryButtonClick}
                      >
                        Save
                      </Button>
                    </Grid>
                    <Grid
                      item
                      xs={3}
                      align="center"
                      style={{ padding: "10px" }}
                    >
                      <Typography
                        component="h4"
                        varient="h4"
                        style={{ width: "fit-content" }}
                      >
                        Current{NBSP}Code:{NBSP}
                        {this.state.code}
                      </Typography>
                    </Grid>
                  </Grid>*/}
                </Grid>
              </Offcanvas.Body>
            </Offcanvas>
            <ButtonGroup aria-label="First group">
              {this.state.loading ? (
                <OverlayTrigger
                  placement="bottom"
                  overlay={
                    <Tooltip id="tooltip-disabled">
                      Fetching your annotations...
                    </Tooltip>
                  }
                >
                  <span className="d-inline-block">
                    <Button
                      variant="primary"
                      onClick={this.handleShow}
                      disabled
                      style={{ pointerEvents: "none" }}
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
                  </span>
                </OverlayTrigger>
              ) : (
                <Button variant="primary" onClick={this.handleShow}>
                  <FiBookOpen />
                </Button>
              )}
            </ButtonGroup>
            <InputGroup>
              <InputGroup.Text>Dictionary Mode:</InputGroup.Text>
              <InputGroup.Text>
                {this.state.dictionaryMode ? "ON" : "OFF"}
              </InputGroup.Text>
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="tooltip-disabled">
                    Toggle{NBSP}Dictionary{NBSP}Mode{" "}
                    {this.state.dictionaryMode ? "ON" : "OFF"}
                  </Tooltip>
                }
              >
                <ToggleButton
                  id="toggle"
                  type="checkbox"
                  variant="outline-success"
                  checked={this.state.dictionaryMode}
                  onChange={this.handleDictionaryModeToggle}
                >
                  <GiArchiveResearch></GiArchiveResearch>
                </ToggleButton>
              </OverlayTrigger>
            </InputGroup>
          </ButtonToolbar>
        </Grid>
        <Grid container style={{ height: "auto", overflowY: "hidden" }}>
          <Grid item xs align="center" style={{ height: "100%" }}>
            <DisplayArea
              ref={(d) => (this.display = d)}
              // mode={this.state.displayMode}
            />
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

// <Container>
//   <InputForm
//     ref={(i) => (this.input = i)}
//     onSubmit={this.triggerAnnotate.bind(this)}
//   />
// <DisplayArea ref={(d) => (this.display = d)} />
// </Container>
