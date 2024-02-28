import React from "react";

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
import {
  GiArchiveResearch,
  GiSpellBook,
  GiSecretBook,
  GiBookshelf,
} from "react-icons/gi";
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
import MemoryButtonGroup from "./MemoryButtonGroup";
import DictionaryButtonGroup from "./DictionaryButtonGroup";
import AnnotationButtonGroup from "./AnnotationButtonGroup";

const MenuToolbar = () => {
  return (
    // <Box>
    //   <ButtonGroup
    //     variant="contained"
    //     aria-label="outlined primary group"
    //     color="blue"
    //   >
    //     <Box>Current{NBSP}Code: </Box>
    //     <Box>5</Box>
    //   </ButtonGroup>

    //   <ButtonGroup
    //     variant="contained"
    //     aria-label="outlined primary button group"
    //   >
    //     <Button>
    //       <TiFolderOpen />
    //     </Button>
    //     <Button>
    //       <MdSave />
    //     </Button>
    //     <Button>
    //       <MdInfoOutline />
    //     </Button>
    //   </ButtonGroup>

    //   <ButtonGroup
    //     variant="contained"
    //     aria-label="outlined primary button group"
    //   >
    //     <Button color="blue"></Button>
    //     <Button color="pink"></Button>
    //   </ButtonGroup>
    // </Box>

    <Box>
      <ButtonToolbar
        className="justify-content-between"
        aria-label="Toolbar with Button groups"
        style={{ gap: "20px" }}
      >
        <MemoryButtonGroup></MemoryButtonGroup>
        <DictionaryButtonGroup></DictionaryButtonGroup>
        <AnnotationButtonGroup></AnnotationButtonGroup>

      </ButtonToolbar>
    </Box>
  );
};

export default MenuToolbar;
