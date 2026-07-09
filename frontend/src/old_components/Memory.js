import React, { Component, useEffect } from "react";
// import styled from "styled-components";
// import { DisplayArea } from "./DisplayArea";
// import { Annotation } from "./Annotation";
import {
  // MdEdit,
  // MdFileDownload,
  // MdFileUpload,
  MdSave,
  MdInfoOutline,
} from "react-icons/md";
// import { FiBookOpen, FiDownload } from "react-icons/fi";
import { TiFolderOpen } from "react-icons/ti";
import { BsArrowBarRight } from "react-icons/bs";
// import { GiArchiveResearch, GiSpellBook, GiSecretBook } from "react-icons/gi";
// import { RiQuillPenFill } from "react-icons/ri";

// import {
//   BrowserRouter as Router,
//   Switch,
//   Route,
//   Link,
//   Redirect,
// } from "react-router-dom";
// import { TextArea } from "semantic-ui-react";
// import styled from "styled-components";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
// import Offcanvas from "react-bootstrap/Offcanvas";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
// import ButtonGroup from "react-bootstrap/ButtonGroup";
import Popover from "react-bootstrap/Popover";
// import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Overlay from "react-bootstrap/Overlay";
import ToggleButton from "react-bootstrap/ToggleButton";
import axios from "axios";

// import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
// import FloatingLabel from "react-bootstrap/FloatingLabel";

const NBSP = "\u00a0";

const UpdatingTooltip = React.forwardRef(
  ({ popper, children, show: _, ...props }, ref) => {
    useEffect(() => {
      console.log("updating!");
      popper.scheduleUpdate();
    }, [children, popper]);

    return (
      <Tooltip ref={ref} {...props}>
        {children}
      </Tooltip>
    );
  }
);

export class Memory extends Component {
  constructor(props) {
    super(props);
    this.display = {};
    this.annotation = {};
    this.fetchOverlay = {};

    this.state = {
      code: 0,
      fetchCode: 0,
      memSaveLoading: false,
    };

    this.handleMemoryCodeChange = this.handleMemoryCodeChange.bind(this);
    this.handleFetchMemoryButtonClick =
      this.handleFetchMemoryButtonClick.bind(this);
    this.handleSaveMemoryButtonClick =
      this.handleSaveMemoryButtonClick.bind(this);

    this.handleHideFetchOverlay = this.handleHideFetchOverlay.bind(this);
    this.handleMemoryInfoButtonClick =
      this.handleMemoryInfoButtonClick.bind(this);
  }

  handleMemoryCodeChange(e) {
    this.setState({
      fetchCode: e.target.value,
    });
  }

  handleFetchMemoryButtonClick() {
    console.log("fetch memory button clicked");
    this.handleHideFetchOverlay();

    // const requestOptions = {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // };

    var params = new URLSearchParams({
      code: this.state.fetchCode,
    });
    // fetch("/api/memory/fetch?" + params.toString(), requestOptions)
    //   .then((response) => response.json())
    //   .then((data) => {
    //     console.log(data);
    //     this.setState(
    //       {
    //         code: data["code"],
    //       },
    //       () => {
    //         console.log(this.state);
    //       }
    //     );
    //     this.props.onUpdateMemory(data["fragments"]);
    //   });

    axios
      .get("/api/memory/fetch?" + params.toString())
      .then((response) => response.data)
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
        this.props.onUpdateMemory(data["fragments"]);
      });
  }

  handleSaveMemoryButtonClick() {
    console.log("save button clicked");
    this.setState({ memSaveLoading: true }, () => {
      console.log("before");
      console.log(this.state);
      // const requestOptions = {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     fragments: this.props.fragments(),
      //   }),
      // };
      // console.log(requestOptions);
      // fetch("/api/memory/save", requestOptions)
      //   .then((response) => response.json())
      //   .then((data) => {
      //     console.log(data);
      //     this.setState(
      //       {
      //         code: data["code"],
      //       },
      //       () => {
      //         console.log(this.state);
      //       }
      //     );
      //   })
      //   .finally(() =>
      //     this.setState(
      //       {
      //         memSaveLoading: false,
      //       },
      //       () => {
      //         console.log("after");
      //         console.log(this.state);
      //       }
      //     )
      //   );

      // const response = await
      axios
        .post("/api/memory/save", {
          fragments: this.props.fragments(),
        })
        .then((response) => response.data)
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
        })
        .finally(() =>
          this.setState(
            {
              memSaveLoading: false,
            },
            () => {
              console.log("after");
              console.log(this.state);
            }
          )
        );
      // const json = ;
    });
  }

  handleHideFetchOverlay() {
    console.log("hideFetchOverlay");

    this.setState({
      fetchOverlayShow: false,
    });
  }

  handleMemoryInfoButtonClick() {
    console.log("memoryInfo");
    //TODO: add info here.
  }

  //TODO: consider adding a lock... so you can overwrite current memories and just remember one code.
  //TODO: add memory info/instructions
  //TODO: Add a page where you can view/edit(add/remove) your memories.
  //TODO: maybe have some sorta history?
  //TODO: change code to some passphrase or email?
  //TODO: maybe add comments?
  render() {
    return (
      <InputGroup aria-label="Memory Group">
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
            <Tooltip id={`tooltip-mem-load-button`}>Load Memory Code</Tooltip>
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
            <UpdatingTooltip id="tooltip-disabled-mem-save">
              {this.state.memSaveLoading ? "Saving..." : "Save Current Memory"}
            </UpdatingTooltip>
          }
        >
          <span className="d-inline-block">
            <Button
              variant="outline-secondary"
              onClick={this.handleSaveMemoryButtonClick}
              disabled={this.state.memSaveLoading}
              style={
                this.state.memSaveLoading
                  ? {
                      borderRadius: 0,
                      pointerEvents: "none",
                    }
                  : {
                      borderRadius: 0,
                    }
              }
            >
              {this.state.memSaveLoading ? (
                <Spinner
                  as="span"
                  animation="border"
                  role="status"
                  size="sm"
                  aria-hidden="true"
                >
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              ) : (
                <MdSave />
              )}
            </Button>
          </span>
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
    );
  }
}
