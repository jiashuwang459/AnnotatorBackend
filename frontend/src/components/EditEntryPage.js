import React, { Component, useEffect, useState } from "react";
// import styled from "styled-components";
import {
  MdEdit,
  MdFileDownload,
  MdFileUpload,
  MdSave,
  MdInfoOutline,
} from "react-icons/md";
import { FiBookOpen, FiDownload } from "react-icons/fi";
import { BiUpArrow } from "react-icons/bi";
import { BsArrowBarRight } from "react-icons/bs";
import { GiArchiveResearch, GiSpellBook, GiSecretBook } from "react-icons/gi";
import { RiQuillPenFill } from "react-icons/ri";
import Collapsible from "react-collapsible";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
// import { TextArea } from "semantic-ui-react";
// import styled from "styled-components";
import { alpha, styled } from "@mui/material/styles";
import axios from "axios";

import Box from "@mui/material/Box";
import { useAnnotations } from "./AnnotationContext";
import Stack from "@mui/material/Stack";
import { Virtuoso } from "react-virtuoso";
import Paper from "@mui/material/Paper";
import Phrase from "./Phrase";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormHelperText from "@mui/material/FormHelperText";

const Item = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  maxWidth: 400,
}));

// const Container = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   /* justify-content: center;*/
//   /* padding: 20px; */
//   position: relative;
//   width: 100%;
//   height: 100%;
//   border: green;
//   border-style: double;
//   font-size: large;
// `;

// const TextArea = styled.textarea`
//   resize: vertical;
//   flex: auto;
//   overflow-y: auto;
//   min-height: 50px;
//   max-height: 150px;
// `;
// const MemoryInput = styled.input``;

// const Display = styled.div`
//   display: flex;
//   width: 100%;
//   padding: 10px;
//   flex-direction: column;
//   overflow-y: auto;
// `;

// const Form = styled.form`
//   padding: 10px;
// `;

// const DefinitionView = styled.div`
//   display: flex;
//   flex-direction: column;
//   border: cyan;
//   border-style: solid;
//   margin: 5px;
//   padding: 5px;
//   gap: 5px;
//   font-size: large;
// `;

// const DefinitionHeader = styled.div`
//   display: flex;
//   flex-direction: row;
//   gap: 5px;
// `;
// const CCharView = styled.div``;
// const PinyinView = styled.div``;
// const EnglishView = styled.div``;

// const IndividualView = styled.div`
//   border: blue;
//   border-style: solid;
// `;

// const IndividualViewHeader = styled.h3`
//   margin: 5px;
// `;
// const IndividualCharView = styled.div`
//   border: chartreuse;
//   border-style: solid;
//   margin: 5px;
// `;

const NBSP = "\u00a0";

const MAX_TRADITIONAL_LENGTH = 20;
const MAX_SIMPLIFIED_LENGTH = 20;
const MAX_PINYIN_LENGTH = 100;
const MAX_ENGLISH_LENGTH = 200;
const MAX_REASON_LENGTH = 1000;
const MAX_NOTES_LENGTH = 1000;
const MAX_TYPE_LENGTH = 10;

// Form fields
const TYPE = "type";
const SIMPLIFIED = "simplified";
const TRADITIONAL = "traditional";
const PINYIN = "pinyin";
const ENGLISH = "english";
const REASON = "reason";
const NOTES = "notes";

const FORM_FIELDS = [
  TYPE,
  SIMPLIFIED,
  TRADITIONAL,
  PINYIN,
  ENGLISH,
  REASON,
  NOTES,
];

// Edit Entry Types
const CUSTOM = "custom";
const PRIORITY = "priority";
const BLACKLIST = "blacklist";
const OTHER = "other";

const EDIT_ENTRY_TYPES = [
  ["Custom", CUSTOM],
  ["Priority", PRIORITY],
  ["Blacklist", BLACKLIST],
  ["Other", OTHER],
];

// TOOD: this function can use memo.
function typeUseField(type, field) {
  if (field === TYPE) {
    return true;
  }
  switch (type) {
    case CUSTOM:
      switch (field) {
        case SIMPLIFIED:
        case TRADITIONAL:
        case PINYIN:
        case ENGLISH:
        case NOTES:
          return true;
        default:
          return false;
      }
    case BLACKLIST:
    case PRIORITY:
      switch (field) {
        case SIMPLIFIED:
        case TRADITIONAL:
        case PINYIN:
        case ENGLISH:
        case REASON:
          return true;
        default:
          return false;
      }

    case OTHER:
      switch (field) {
        case SIMPLIFIED:
        case TRADITIONAL:
        case PINYIN:
        case ENGLISH:
        case REASON:
        case NOTES:
          return true;
        default:
          return false;
      }
    default:
      return false;
  }
}

const EditEntryPage = (props) => {
  const [displayText, setDisplayText] = useState("");
  const [traditional, setTraditional] = useState("");
  const [simplified, setSimplified] = useState("");
  const [pinyin, setPinyin] = useState("");
  const [english, setEnglish] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState("");

  const [traditionalError, setTraditionalError] = useState(false);
  const [simplifiedError, setSimplifiedError] = useState(false);
  const [pinyinError, setPinyinError] = useState(false);
  const [englishError, setEnglishError] = useState(false);
  const [reasonError, setReasonError] = useState(false);
  const [notesError, setNotesError] = useState(false);
  const [typeError, setTypeError] = useState(false);

  const loading = false;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formValid()) {
      return;
    }

    function postBody() {
      let body = {};
      if (typeUseField(type, TYPE)) {
        body[TYPE] = type;
      }
      if (typeUseField(type, TRADITIONAL)) {
        body[TRADITIONAL] = traditional;
      }
      if (typeUseField(type, SIMPLIFIED)) {
        body[SIMPLIFIED] = simplified;
      }
      if (typeUseField(type, PINYIN)) {
        body[PINYIN] = pinyin;
      }
      if (typeUseField(type, ENGLISH)) {
        body[ENGLISH] = english;
      }
      if (typeUseField(type, REASON)) {
        body[REASON] = reason;
      }
      if (typeUseField(type, NOTES)) {
        body[NOTES] = notes;
      }
      return body;
    }

    const response = await axios.post("/api/entry/edit", postBody());

    console.log(response.data);
    setDisplayText(JSON.stringify(response.data));
  };

  function handleTraditionalChange(e) {
    setTraditional(e.target.value);
    setTraditionalError(e.target.value.length > MAX_TRADITIONAL_LENGTH);
  }
  function handleSimplifiedChange(e) {
    setSimplified(e.target.value);
    setSimplifiedError(e.target.value.length > MAX_SIMPLIFIED_LENGTH);
  }
  function handlePinyinChange(e) {
    setPinyin(e.target.value);
    setPinyinError(e.target.value.length > MAX_PINYIN_LENGTH);
  }
  function handleEnglishChange(e) {
    setEnglish(e.target.value);
    setEnglishError(e.target.value.length > MAX_ENGLISH_LENGTH);
  }
  function handleReasonChange(e) {
    setReason(e.target.value);
    setReasonError(e.target.value.length > MAX_REASON_LENGTH);
  }
  function handleNotesChange(e) {
    setNotes(e.target.value);
    setNotesError(e.target.value.length > MAX_NOTES_LENGTH);
  }
  function handleTypeChange(e) {
    setType(e.target.value);
    setTypeError(e.target.value.length > MAX_TYPE_LENGTH);
  }

  function formValid() {
    if (loading) {
      return false;
    }

    for (const field of FORM_FIELDS) {
      console.log;
      if (typeUseField(type, field)) {
        if (!fieldValid(field)) {
          return false;
        }
      }
    }

    return true;
  }

  function fieldValid(field) {
    switch (field) {
      case TYPE:
        return !typeError && type;
      case SIMPLIFIED:
        return !simplifiedError && simplified;
      case TRADITIONAL:
        return !traditionalError && traditional;
      case PINYIN:
        return !pinyinError && pinyin;
      case ENGLISH:
        return !englishError && english;
      case REASON:
        return !reasonError && reason;
      case NOTES:
        return !notesError && notes;
      default:
        return false;
    }
  }

  function createSimplifiedView() {
    return (
      <Item>
        <FormControl fullWidth>
          <InputLabel htmlFor="simplified-text">Simplified Chinese</InputLabel>
          <OutlinedInput
            id="simplified-text"
            value={simplified}
            label="Simplified Chinese"
            onChange={handleSimplifiedChange}
            disabled={loading}
            error={simplifiedError}
          />
          <FormHelperText hidden={!simplifiedError}>
            max {MAX_SIMPLIFIED_LENGTH} characters
          </FormHelperText>
        </FormControl>
      </Item>
    );
  }
  function createTraditionalView() {
    return (
      <Item>
        <FormControl fullWidth>
          <InputLabel htmlFor="traditional-text">
            Traditional Chinese
          </InputLabel>
          <OutlinedInput
            id="traditional-text"
            value={traditional}
            onChange={handleTraditionalChange}
            label="Traditional Chinese"
            disabled={loading}
            error={traditionalError}
          />
          <FormHelperText hidden={!traditionalError}>
            max {MAX_TRADITIONAL_LENGTH} characters
          </FormHelperText>
        </FormControl>
      </Item>
    );
  }
  function createPinyinView() {
    return (
      <Item>
        <FormControl fullWidth>
          <InputLabel htmlFor="pinyin-text">Pinyin</InputLabel>
          <OutlinedInput
            id="pinyin-text"
            value={pinyin}
            onChange={handlePinyinChange}
            label="pinyin"
            disabled={loading}
            error={pinyinError}
          />
          <FormHelperText hidden={!pinyinError}>
            max {MAX_PINYIN_LENGTH} characters
          </FormHelperText>
        </FormControl>
      </Item>
    );
  }
  function createEnglishView() {
    return (
      <Item>
        <FormControl fullWidth>
          <InputLabel htmlFor="english-text">English</InputLabel>
          <OutlinedInput
            id="english-text"
            value={english}
            onChange={handleEnglishChange}
            label="english"
            disabled={loading}
            error={englishError}
          />
          <FormHelperText hidden={!englishError}>
            max {MAX_ENGLISH_LENGTH} characters
          </FormHelperText>
        </FormControl>
      </Item>
    );
  }
  function createReasonView() {
    return (
      <Item>
        <FormControl fullWidth>
          <InputLabel htmlFor="reason-text">Reason</InputLabel>
          <OutlinedInput
            id="reason-text"
            value={reason}
            onChange={handleReasonChange}
            label="reason"
            disabled={loading}
            error={reasonError}
          />
          <FormHelperText hidden={!reasonError}>
            max {MAX_REASON_LENGTH} characters
          </FormHelperText>
        </FormControl>
      </Item>
    );
  }
  function createNotesView() {
    return (
      <Item>
        <FormControl fullWidth>
          <InputLabel htmlFor="notes-text">Notes</InputLabel>
          <OutlinedInput
            id="notes-text"
            value={notes}
            onChange={handleNotesChange}
            label="notes"
            disabled={loading}
            error={notesError}
          />
          <FormHelperText hidden={!notesError}>
            max {MAX_NOTES_LENGTH} characters
          </FormHelperText>
        </FormControl>
      </Item>
    );
  }

  return (
    <Paper>
      {/* <Form onSubmit={handleSubmit}>
        <h1>Lookup Chinese in Dictionary</h1>
        <p>Enter Chinese: </p>
        <input type="text" name="cchars" onChange={handleCcharChange} />
        <input type="submit" />
      </Form> */}

      <Stack
        spacing={1}
        divider={<Divider orientation="horizontal" flexItem />}
        style={{ height: "100%" }}
      >
        <Item>This is a small demo for editing entries.</Item>
        <Item>
          <Stack spacing={1}>
            <Item>
              <FormControl fullWidth>
                <InputLabel htmlFor="type-text">Type</InputLabel>
                <Select
                  id="type-text"
                  value={type}
                  onChange={handleTypeChange}
                  label="type"
                  disabled={loading}
                  error={typeError}
                  native
                >
                  <option aria-label="None" value="" />
                  {EDIT_ENTRY_TYPES.map(([display, value]) => (
                    <option key={value} value={value}>
                      {`${display}`}
                    </option>
                  ))}
                </Select>
                <FormHelperText hidden={!typeError}>
                  max {MAX_TYPE_LENGTH} characters
                </FormHelperText>
              </FormControl>
            </Item>
            {typeUseField(type, SIMPLIFIED) ? createSimplifiedView() : ""}
            {typeUseField(type, TRADITIONAL) ? createTraditionalView() : ""}
            {typeUseField(type, PINYIN) ? createPinyinView() : ""}
            {typeUseField(type, ENGLISH) ? createEnglishView() : ""}
            {typeUseField(type, REASON) ? createReasonView() : ""}
            {typeUseField(type, NOTES) ? createNotesView() : ""}
          </Stack>
        </Item>
        <Item
          style={{
            alignSelf: "end",
          }}
        >
          <Button
            id="edit_entry_submit_button"
            variant="primary"
            onClick={handleSubmit}
            disabled={!formValid()}
            sx={{ ml: 1 }}
            type="submit"
          >
            Submit Entry Edit
          </Button>
        </Item>
      </Stack>
    </Paper>
  );
};

export default EditEntryPage;
