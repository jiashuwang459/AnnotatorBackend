import React, { Component, useEffect } from "react";
// import styled from "styled-components";
import { DisplayArea } from "./DisplayArea";
import { Annotation } from "./Annotation";
import { Memory } from "./Memory";
import { UpdatingTooltip } from "./UpdatingTooltip";
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
import { GiArchiveResearch, GiSpellBook, GiSecretBook } from "react-icons/gi";
import { RiQuillPenFill } from "react-icons/ri";

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
import { Grid } from "@material-ui/core";
// import { TextArea } from "semantic-ui-react";
import styled from "styled-components";
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
    this.memory = {};
    this.fetchOverlay = {};

    this.state = {
      text: "",
      loading: false,
      dictionaryMode: false,
      dictEdit: false,
    };

    this.handleClose = this.handleClose.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.handleAnnotate = this.handleAnnotate.bind(this);
    this.handleFetchMemory = this.handleFetchMemory.bind(this);
    this.handleGetMemoryFragments = this.handleGetMemoryFragments.bind(this);
    this.handleCloseAnnotation = this.handleCloseAnnotation.bind(this);
    this.handleDictEditToggle = this.handleDictEditToggle.bind(this);
    this.handleDictionaryModeToggle =
      this.handleDictionaryModeToggle.bind(this);
  }

  handleAnnotate = async (text) => {
    this.setState(
      {
        loading: true,
        text: text,
        show: false,
      },
      async () => {
        try {
          this.display.resetDisplay();

          var paragraphs = text.split("\n");
          for (var i = 0; i < paragraphs.length - 1; i++) {
            paragraphs[i] += "\n";
          }

          for (var paragraph of paragraphs) {
            console.log(paragraph);
            if (paragraph == "") {
              this.display.updateDisplay([]);
              continue;
            }
            const requestOptions = {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                text: paragraph,
              }),
            };

            const response = await fetch("/api/annotate", requestOptions);
            const json = await response.json();
            console.log(json);
            await this.display.updateDisplay(json);
            // .then((response) => {
            //   console.log(response.status);
            //   if (!response.ok) {
            //     throw new Error("HTTP status " + response.status);
            //   }
            //   return response.json();
            // })
            // .then((data) => {
            //   console.log(data); //TODO： validation for all data
            //   this.display.updateDisplay(data);
            // });
          }
        } finally {
          this.setState({
            loading: false,
          });
        }
      }
    );
  };

  handleGetMemoryFragments(){
    return this.display.getMemory()
  }

  handleFetchMemory(fragments) {
    this.display.updateMemory(fragments);
  }

  handleShow() {
    console.log("show");
    this.setState({
      show: true,
    });
  }

  handleClose() {
    console.log("close");
    this.setState({
      show: false,
    });
  }

  handleCloseAnnotation(text) {
    console.log("closeAnnotation");
    this.setState({
      text: text,
    });
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

  handleDictEditToggle(e) {
    console.log("dictionary edit toggle");
    console.log(e);
    this.setState(
      {
        dictEdit: e.currentTarget.checked,
      },
      () => {
        // console.log(this.state);
        // this.display.setDictEdit(this.state.dictEdit);
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
            <Memory
              ref={(m) => (this.memory = m)}
              onUpdateMemory={this.handleFetchMemory}
              fragments={this.handleGetMemoryFragments}
            />

            <InputGroup aria-label="Dictionary Group">
              {/*TODO: determine if we need this label here... or maybe take a way the icon button? but I like the button... :') */}
              <InputGroup.Text>Dictionary</InputGroup.Text>
              {/* <InputGroup.Text style={{ width: "75px" }}>
                {this.state.dictionaryMode ? "ON" : "OFF"}
              </InputGroup.Text> */}
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="tooltip-disabled">
                    {this.state.dictionaryMode ? "Close" : "Open"}
                    {NBSP}Dictionary
                  </Tooltip>
                }
              >
                <ToggleButton
                  id="toggle_dict"
                  type="checkbox"
                  variant="outline-success"
                  checked={this.state.dictionaryMode}
                  onChange={this.handleDictionaryModeToggle}
                >
                  {this.state.dictionaryMode ? (
                    <GiSpellBook></GiSpellBook>
                  ) : (
                    <GiSecretBook></GiSecretBook>
                  )}
                </ToggleButton>
              </OverlayTrigger>
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="tooltip-disabled">
                    {this.state.dictEdit ? "No Edit" : "Edit"}
                    {NBSP}Dictionary
                  </Tooltip>
                }
              >
                <ToggleButton
                  id="toggle_edit"
                  type="checkbox"
                  variant="outline-success"
                  checked={this.state.dictEdit}
                  onChange={this.handleDictEditToggle}
                >
                  <MdEdit></MdEdit>
                </ToggleButton>
              </OverlayTrigger>
            </InputGroup>
            <ButtonGroup aria-label="Manual Annotation Group">
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
                  </Grid>
                </Offcanvas.Body>
              </Offcanvas>
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <UpdatingTooltip id="tooltip-disabled-manual">
                    {this.state.loading
                      ? "Fetching your annotations..."
                      : "Manual Entry"}
                  </UpdatingTooltip>
                }
              >
                <span className="d-inline-block">
                  {this.state.loading ? (
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
                  ) : (
                    <Button variant="primary" onClick={this.handleShow}>
                      <RiQuillPenFill />
                    </Button>
                  )}
                </span>
              </OverlayTrigger>
            </ButtonGroup>
          </ButtonToolbar>
        </Grid>
        <Grid container style={{ height: "100%", overflowY: "hidden" }}>
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