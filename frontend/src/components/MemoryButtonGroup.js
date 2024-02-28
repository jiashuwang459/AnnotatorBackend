import React, { useState, useEffect } from "react";

import Grid from "@mui/material/Unstable_Grid2";
import Box from "@mui/material/Box";
import { MenuItem } from "@mui/material";

import { green, purple } from "@mui/material/colors";
//import { Button } from "@mui/material";
//import { ButtonGroup } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";

import { TiFolderOpen } from "react-icons/ti";
import { BsArrowBarRight } from "react-icons/bs";
import NBSP from "./Utils";
import { GiArchiveResearch, GiSpellBook, GiSecretBook } from "react-icons/gi";
import { RiQuillPenFill } from "react-icons/ri";

import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import InputGroup from "react-bootstrap/InputGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import FormControl from "react-bootstrap/FormControl";
import Overlay from "react-bootstrap/OverlayTrigger";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Popover from "react-bootstrap/Popover";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";

import {
  MdEdit,
  MdFileDownload,
  MdFileUpload,
  MdSave,
  MdInfoOutline,
} from "react-icons/md";

//TODO: add info page
//TODO: actually save the fragments, or have the parent save it.

const UpdatingTooltip = React.forwardRef(
  ({ popper, children, show: _, ...props }, ref) => {
    useEffect(() => {
      popper.scheduleUpdate();
    }, [children, popper]);

    return (
      <Tooltip ref={ref} {...props}>
        {children}
      </Tooltip>
    );
  }
);


const MemoryButtonGroup = () => {
  const [memoryCode, setMemoryCode] = useState(0);
  const [fetchCode, setFetchCode] = useState(0);
  const [savingInProgress, setSavingInProgress] = useState(false);

  function handleFetchCodeChange(e) {
    setFetchCode(e.target.value);
  }

  function handleFetchCodeButtonClick() {
    var params = new URLSearchParams({
      code: fetchCode,
    });

    axios
      .get("/api/memory/fetch?" + params.toString())
      .then((response) => response.data)
      .then((data) => {
        console.log(data);
        setMemoryCode(data["code"]);
        //TODO: pass fragments back to parent, or have parent make this call instead.
        // this.props.onUpdateMemory(data["fragments"]);
      });
  }

  function handleSaveCodeButtonClick() {
    if (savingInProgress) {
      return;
    }
    setSavingInProgress(true);

    axios
      .post("/api/memory/save", {
        fragments: [],
      })
      .then((response) => response.data)
      .then((data) => {
        setMemoryCode(data["code"]);
      })
      .finally(() => setSavingInProgress(false));
  }

  return (
    <InputGroup aria-label="Memory Group">
      <InputGroup.Text>
        Current{NBSP}Memory{NBSP}Code:
      </InputGroup.Text>
      <FormControl
        type="number"
        min="0"
        value={memoryCode}
        readOnly
        style={{ width: "50px" }}
      />
      <OverlayTrigger
        placement="bottom"
        trigger="click"
        overlay={
          <Popover>
            <Popover.Header>Load Memory Code</Popover.Header>
            <Popover.Body>
              <InputGroup>
                <InputGroup.Text>Code:</InputGroup.Text>
                <FormControl
                  type="number"
                  min={0}
                  value={fetchCode}
                  onChange={handleFetchCodeChange}
                  style={{ textAlign: "center", width: "100px" }}
                />
                <Button
                  variant="outline-secondary"
                  onClick={handleFetchCodeButtonClick}
                >
                  <BsArrowBarRight></BsArrowBarRight>
                </Button>
              </InputGroup>
            </Popover.Body>
          </Popover>
        }
      >
        <Button variant="outline-secondary">
          <TiFolderOpen />
        </Button>
      </OverlayTrigger>

      <OverlayTrigger
        placement="bottom"
        overlay={
          <UpdatingTooltip id="tooltip-disabled-mem-save">
            {savingInProgress ? "Saving..." : "Save Current Memory"}
          </UpdatingTooltip>
        }
      >
        <ToggleButton
          id="toggle_save_mem"
          type="checkbox"
          variant="outline-secondary"
          checked={savingInProgress}
          onChange={handleSaveCodeButtonClick}
        >
          {savingInProgress ? (
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
        </ToggleButton>
      </OverlayTrigger>
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-mem-info-button`}>Info on Memory Codes</Tooltip>
        }
      >
        <Button variant="outline-secondary">
          <MdInfoOutline />
        </Button>
      </OverlayTrigger>
    </InputGroup>
  );
};

export default MemoryButtonGroup;
