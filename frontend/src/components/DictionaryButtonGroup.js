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
  const [dictionaryMode, setDictionaryMode] = useState(false);
  // const [dictEdit, setFetchCode] = useState(0);

  function handleDictionaryModeToggle(e) {
    // console.log("dictionary mode toggle", e);
    setDictionaryMode(e.currentTarget.checked);
  }

  return (
    <InputGroup aria-label="Dictionary Group">
      <InputGroup.Text>Dictionary</InputGroup.Text>
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id="tooltip-disabled">
            {dictionaryMode ? "Close" : "Open"}
            {NBSP}Dictionary
          </Tooltip>
        }
      >
        <ToggleButton
          id="toggle_dict"
          type="checkbox"
          variant="outline-success"
          checked={dictionaryMode}
          onChange={handleDictionaryModeToggle}
        >
          {dictionaryMode ? (
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
        disabled
      >
        <MdEdit></MdEdit>
      </ToggleButton>
    </InputGroup>
  );
};

export default DictionaryButtonGroup;
