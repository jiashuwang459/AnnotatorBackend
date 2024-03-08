import React, { useState, useEffect, useRef } from "react";

import Grid from "@mui/material/Unstable_Grid2";
import Box from "@mui/material/Box";
import { MenuItem } from "@mui/material";

import { green, purple } from "@mui/material/colors";
//import { Button } from "@mui/material";
//import { ButtonGroup } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";

import { TiFolder, TiFolderOpen } from "react-icons/ti";
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
import ClickAwayListener from '@mui/material/ClickAwayListener';

import {
  MdEdit,
  MdFileDownload,
  MdFileUpload,
  MdSave,
  MdInfoOutline,
} from "react-icons/md";

import { useMemoryDispatch, useMemory } from "./MemoryContext";

//TODO: add info page
//TODO: maybe add a 'saving' variable to the memoryContext, so we can't load and save at the same time.
//TODO: perhaps rewrite current load popover with material-ui's barebones tooltip/popover or maybe with new floating ui.
// https://mui.com/material-ui/react-tooltip

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
  const [showLoadPopup, setShowLoadPopup] = useState(false);

  const dispatch = useMemoryDispatch();
  const memory = useMemory();
  const loading = memory.loading;
  const fragments = memory.fragments;

  function handleCloseLoadPopup() {
    setShowLoadPopup(false);
  }

  function handleFetchCodeChange(e) {
    setFetchCode(e.target.value);
  }

  const handleFetchCodeButtonClick = async () => {
    if (loading) {
      return;
    }

    dispatch({ type: "init", code: fetchCode });
    try {
      var params = new URLSearchParams({
        code: fetchCode,
      });
      const response = await axios.get(
        "/api/memory/fetch?" + params.toString()
      );
      const data = response.data;
      console.log(data);

      const newCode = data["code"];
      const dfrags = data["fragments"];
      setMemoryCode(newCode);
      dispatch({ type: "set", code: newCode, fragments: dfrags });
    } catch (err) {
      dispatch({ type: "error", error: err });
    } finally {
      dispatch({ type: "done" });
    }

    setShowLoadPopup(false);
  };

  function handleSaveCodeButtonClick() {
    if (savingInProgress) {
      return;
    }
    setSavingInProgress(true);

    axios
      .post("/api/memory/save", {
        fragments: fragments,
      })
      .then((response) => response.data)
      .then((data) => {
        const newCode = data["code"];
        dispatch({ type: "save", code: newCode });
        setMemoryCode(newCode);
      })
      .finally(() => setSavingInProgress(false));
  }

  const handleToggleMemoryLoad = (e) => {
    if (!showLoadPopup) {
      setShowLoadPopup(true);
    } else {
      setShowLoadPopup(false);
    }
  };

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

      <ClickAwayListener onClickAway={handleCloseLoadPopup}>
        <div>
          <OverlayTrigger
            placement="bottom"
            show={showLoadPopup}
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
            <ToggleButton
              id="toggle_load_memory"
              type="checkbox"
              variant="outline-secondary"
              checked={showLoadPopup}
              onClick={handleToggleMemoryLoad}
              disabled={loading}
            >
              {loading ? (
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
                <TiFolderOpen />
              )}
            </ToggleButton>
          </OverlayTrigger>
        </div>
      </ClickAwayListener>
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
