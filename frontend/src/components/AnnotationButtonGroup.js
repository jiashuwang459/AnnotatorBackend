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
import Offcanvas from "react-bootstrap/Offcanvas";

import {
  MdEdit,
  MdFileDownload,
  MdFileUpload,
  MdSave,
  MdInfoOutline,
} from "react-icons/md";
import MemoryButtonGroup from "./MemoryButtonGroup";
import DictionaryButtonGroup from "./DictionaryButtonGroup";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";

import { useAnnotationDispatch, useAnnotations } from "./AnnotationContext";
const Item = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  maxWidth: 400,
}));

const AnnotationButtonGroup = () => {
  const [showBookshelf, setShowBookshelf] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  //const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");

  const dispatch = useAnnotationDispatch();
  const annotations = useAnnotations();

  const loading = annotations.loading;

  const handleCloseBookshelf = () => setShowBookshelf(false);
  const handleShowBookshelf = () => {
    setShowManualEntry(false);
    setShowBookshelf(true);
  };

  const handleToggleBookshelf = () => {
    if (!showBookshelf) {
      handleShowBookshelf();
    } else {
      handleCloseBookshelf();
    }
  };

  const handleCloseManualEntry = () => setShowManualEntry(false);
  const handleShowManualEntry = () => {
    setShowBookshelf(false);
    setShowManualEntry(true);
  };

  const handleToggleManualEntry = () => {
    if (!showManualEntry) {
      handleShowManualEntry();
    } else {
      handleCloseManualEntry();
    }
  };

  const handleTextChange = async (e) => {
    setText(e.target.value);
  };

  const handleManualAnnotationSubmit = async () => {
    if (loading) {
      return;
    }
    //setLoading(true);
    setShowManualEntry(false);
    dispatch({ type: "fetch", sourceText: text });

    //notify parent loading with current text;
    try {
      console.log(text);
      var paragraphs = text.split("\n");
      for (var i = 0; i < paragraphs.length - 1; i++) {
        paragraphs[i] += "\n";
      }

      for (var paragraph of paragraphs) {
        const response = await axios.post("/api/annotate", {
          text: paragraph,
        });
        const json = response.data;
        dispatch({ type: "add", content: json });
      }
    } catch (err) {
      dispatch({ type: "error", error: err });
    } finally {
      dispatch({ type: "done" });
    }
  };

  return (
    <ButtonGroup aria-label="Annotation Group">
      <ToggleButton
        id="toggle_bookshelf"
        type="checkbox"
        variant="outline-secondary"
        checked={showBookshelf}
        onClick={handleToggleBookshelf}
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
          <GiBookshelf />
        )}
      </ToggleButton>
      <Offcanvas
        show={showBookshelf}
        onHide={handleCloseBookshelf}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Bookshelf</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          Here, you can see your books or past articles you have saved.
        </Offcanvas.Body>
      </Offcanvas>

      <ToggleButton
        id="toggle_manual_annotation"
        type="checkbox"
        variant="outline-secondary"
        checked={showManualEntry}
        onClick={handleToggleManualEntry}
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
          <RiQuillPenFill />
        )}
      </ToggleButton>
      <Offcanvas
        show={showManualEntry}
        onHide={handleCloseManualEntry}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Manual Entry</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Stack
            spacing={2}
            divider={<Divider orientation="horizontal" flexItem />}
            style={{ height: "100%" }}
          >
            <Item>
              Here, you can Manually enter in some text to annotate. This is the
              manual entry page, where you can paste in a section of chinese
              text and we will annotate pinyin onto them! Simply paste your text
              into the Textbox below and press annotate to get started!
            </Item>
            <Item>
              <FormControl
                component="fieldset"
                as="textarea"
                value={text}
                style={{
                  padding: "5px",
                  width: "100%",
                  maxHeight: "100%",
                }}
                onChange={handleTextChange}
                rows={5}
              ></FormControl>
            </Item>
            <Item
              style={{
                alignSelf: "end",
              }}
            >
              <Button
                id="toggle_manual_annotation_submit"
                variant="primary"
                onClick={handleManualAnnotationSubmit}
                disabled={text.length === 0 || loading}
              >
                Annotate
              </Button>
            </Item>
          </Stack>
        </Offcanvas.Body>
      </Offcanvas>
    </ButtonGroup>
  );
};

export default AnnotationButtonGroup;
