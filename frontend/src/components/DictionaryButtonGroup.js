import React, { useState } from "react";

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
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useModeDispatch, useMode } from "./ModeContext";

import {
  MdEdit,
  MdFileDownload,
  MdFileUpload,
  MdSave,
  MdInfoOutline,
} from "react-icons/md";

//TODO: add functionality for dict edit
//TODO: pass dictionary mode to parent?

const DictionaryButtonGroup = () => {
  // const [dictionaryMode, setDictionaryMode] = useState(false);
  // const [dictEdit, setFetchCode] = useState(0);

  const dispatch = useModeDispatch();
  const mode = useMode();
  const dictMode = mode.dictMode;
  const editMode = mode.editMode;

  function handleDictionaryModeToggle(e) {
    // console.log("dictionary mode toggle", e);
    if(e.currentTarget.checked) {
      dispatch({ type: "dict" });
    } else {
      dispatch({ type: "read" });
    }
  }
  
  function handleEditModeToggle(e) {
    // console.log("edit mode toggle", e);
    if(e.currentTarget.checked) {
      dispatch({ type: "edit" });
    } else {
      dispatch({ type: "read" });
    }
  }

  return (
    <InputGroup aria-label="Dictionary Group">
      <InputGroup.Text>Dictionary</InputGroup.Text>
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id="tooltip-disabled">
            {dictMode ? "Close" : "Open"}
            {NBSP}Dictionary
          </Tooltip>
        }
      >
        <ToggleButton
          id="toggle_dict"
          type="checkbox"
          variant="outline-success"
          checked={dictMode}
          onChange={handleDictionaryModeToggle}
        >
          {dictMode ? (
            <GiSpellBook></GiSpellBook>
          ) : (
            <GiSecretBook></GiSecretBook>
          )}
        </ToggleButton>
      </OverlayTrigger>
      <ToggleButton
        id="toggle_edit"
        type="checkbox"
        variant="outline-success"
        checked={editMode}
        onChange={handleEditModeToggle}
        //disabled
      >
        <MdEdit></MdEdit>
      </ToggleButton>
    </InputGroup>
  );
};

export default DictionaryButtonGroup;
