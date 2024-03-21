import React, { useState } from "react";

import Grid from "@mui/material/Unstable_Grid2";
import Box from "@mui/material/Box";

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
import NativeSelect from "@mui/material/NativeSelect";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl2 from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";

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
  const [novelName, setNovelName] = useState("");
  const [chapter, setChapter] = useState("");
  const [test, setTest] = useState("");

  const novels = {
    CYWLZNRBHD: [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
    ],
    "N/A": ["6", "7", "8", "9"],
  };
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

  const handleAnnotation = async (text) => {
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

  const handleManualAnnotationSubmit = async () => {
    if (loading) {
      return;
    }
    setShowManualEntry(false);
    handleAnnotation(text);
  };

  const handleNovelUpdate = (e) => {
    setNovelName(e.target.value);
    setChapter("");
  };

  const handleChapterUpdate = (e) => {
    setChapter(e.target.value);
  };

  const handleBookSubmit = async () => {
    if (loading) {
      return;
    }
    setShowBookshelf(false);
    dispatch({ type: "fetch_book" });
    // TOOD: fetch book from backend.
    book_text = "大家好！";
    handleAnnotation(book_text);
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
          <Stack
            spacing={2}
            divider={<Divider orientation="horizontal" flexItem />}
            style={{ height: "100%" }}
          >
            <Item>
              Here, you can see books or saved articles or snippets. You can
              select one of them and we will open it and annotate pinyin onto
              them! Select the text into the list below and press annotate to
              get started!
            </Item>
            <Item>
              <Stack spacing={1}>
                <Item>
                  <FormControl2 variant="standard" fullWidth>
                    <InputLabel id="novel-select-label">Novel</InputLabel>
                    <Select
                      labelId="novel-select-label"
                      id="novel-select"
                      value={novelName}
                      label="Novel"
                      onChange={handleNovelUpdate}
                      disabled={loading}
                      native
                    >
                      <option aria-label="None" value="" />
                      {Object.entries(novels).map(([novelName, chapters]) => (
                        <option key={novelName} value={novelName}>
                          {novelName}
                          {"["}
                          {chapters.length}
                          {"]"}
                        </option>
                      ))}
                    </Select>
                  </FormControl2>
                </Item>
                <Item>
                  <FormControl2 variant="filled" fullWidth>
                    <InputLabel id="chapter-select-label">Chapter</InputLabel>
                    <Select
                      labelId="chapter-select-label"
                      id="chapter-select"
                      value={chapter}
                      label="Chapter"
                      onChange={handleChapterUpdate}
                      disabled={!novelName || loading}
                      native
                    >
                      <option aria-label="None" value="" />
                      {novelName
                        ? novels[novelName]?.map((chapter) => (
                            <option key={chapter} value={chapter}>
                              {chapter}
                            </option>
                          ))
                        : ""}
                    </Select>
                    <FormHelperText hidden={novelName}>
                      Select Novel First
                    </FormHelperText>
                  </FormControl2>
                </Item>
                <Item>
                  <FormControl2 variant="filled" fullWidth>
                    <InputLabel id="filled-select-label">Test</InputLabel>
                    <Select
                      labelId="filled-select-label"
                      id="filled-select"
                      value={test}
                      label="Filled Test"
                      onChange={handleChapterUpdate}
                      autoWidth
                    >
                      <MenuItem key="Test" value="test">
                        test
                      </MenuItem>
                      <MenuItem key="Test2" value="test2">
                        test2
                      </MenuItem>
                    </Select>
                    <FormHelperText>Test filled non native</FormHelperText>
                  </FormControl2>
                </Item>
                <Item>
                  <FormControl2 variant="standard" fullWidth>
                    <InputLabel id="standard-select-label">Test</InputLabel>
                    <Select
                      labelId="standard-select-label"
                      id="standard-select"
                      value={test}
                      label="Standard Test"
                      onChange={handleChapterUpdate}
                      autoWidth
                    >
                      <MenuItem key="Test" value="test">
                        test
                      </MenuItem>
                      <MenuItem key="Test2" value="test2">
                        test2
                      </MenuItem>
                    </Select>
                    <FormHelperText>Test standard non native</FormHelperText>
                  </FormControl2>
                </Item>
                <Item>
                  <FormControl2 variant="outlined" fullWidth>
                    <InputLabel id="outlined-select-label">Test</InputLabel>
                    <Select
                      labelId="outlined-select-label"
                      id="outlined-select"
                      value={test}
                      label="Outlined Test"
                      onChange={handleChapterUpdate}
                      autoWidth
                    >
                      <MenuItem key="Test" value="test">
                        test
                      </MenuItem>
                      <MenuItem key="Test2" value="test2">
                        test2
                      </MenuItem>
                    </Select>
                    <FormHelperText>Test outlined non native</FormHelperText>
                  </FormControl2>
                </Item>
              </Stack>
            </Item>
            <Item
              style={{
                alignSelf: "end",
              }}
            >
              <Button
                id="toggle_bookshelf_submit"
                variant="primary"
                onClick={handleBookSubmit}
                disabled={!novelName || !chapter || loading}
                sx={{ ml: 1 }}
                type="submit"
              >
                Fetch Novel
              </Button>
            </Item>
          </Stack>
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
