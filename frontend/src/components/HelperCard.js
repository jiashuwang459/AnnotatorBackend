import React, { useState, useEffect } from "react";
import { List } from "semantic-ui-react";
import styled from "styled-components";
import { MemoryRouter } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { MDBPopover, MDBPopoverBody, MDBPopoverHeader } from "mdb-react-ui-kit";
import Typography from "@mui/material/Typography";
import { Button, CardActionArea, CardActions } from "@mui/material";
import MyButton from "react-bootstrap/Button";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Virtuoso } from "react-virtuoso";
import { RiQuillPenFill } from "react-icons/ri";
import Popover from "@mui/material/Popover";
import Popper from "@mui/material/Popper";
import IconButton from "@mui/material/IconButton";
import { createPopper } from "@popperjs/core";
import CloseIcon from "@mui/icons-material/Close";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import PushPinIcon from "@mui/icons-material/PushPin";
import ToggleButton from "@mui/material/ToggleButton";
import MobileStepper from "@mui/material/MobileStepper";
import axios from "axios";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  /* justify-content: center;*/
  /* padding: 20px; */
  position: relative;
  width: 100%;
  height: 100%;
  border: green;
  border-style: double;
  font-size: large;
`;

const CardHeader = styled.div`
  display: flex;
  flex-direction: row;
  padding: 5px;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 180px;
  overflow-y: auto;
  padding: 5px;
`;

const PopoverCChar = styled.span`
  flex: auto;
  padding-right: 15px;
  font-size: larger;
`;

const PopoverPinyin = styled.span`
  flex: auto;
  font-size: small;
`;

const Display = styled.div`
  display: flex;
  width: 100%;
  padding: 10px;
  flex-direction: row;
  flex-wrap: wrap;
  overflow-y: auto;
`;

const Text = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  font-size: x-large;
`;

const Annotation = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  font-size: small;
`;

const PhraseContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const CharacterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 5px;
`;

const NewLineContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 5px;
  width: 100%;
`;

const MemoryInput = styled.input``;

const MemoryButton = styled.button`
  margin: auto;
`;

// const NBSP = "\u00a0";
// const HIDDEN = { visibility: "hidden" };

const HelperCard = (props) => {
  const [entries, setEntries] = useState([]);
  const [maxSteps, setMaxSteps] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  // const [individual, setIndividual] = useState([]);
  // const [cchars, setCchars] = useState("");
  const phrase = props.phrase;
  const vowels = require("../../../data/vowels.json");

  const loadPhrase = async (phrase) => {
    console.log("loadPhrase", phrase);

    var params = new URLSearchParams({
      phrase: phrase.cchars.map((item) => item.cchar).join(""),
    });

    const response = await axios.get("/api/entry?" + params.toString());
    const data = response.data;
    console.log(data);
    return data;
  };

  useEffect(() => {
    let ignore = false;
    setEntries(null);
    loadPhrase(phrase).then((result) => {
      if (!ignore) {
        setEntries(result);
        setMaxSteps(result.length);
      }
    });
    return () => {
      ignore = true;
    };
  }, [phrase]);

  // TODO march 14, 2024 : pre-parse pinyin into the dictionary itself.
  function parsePinyin(pinyin) {
    if (pinyin == undefined || pinyin == "") {
      return "";
    }
    //special case with no vowel
    if (pinyin == "r5") {
      return "r";
    }

    let accent = pinyin[pinyin.length - 1];
    var word = pinyin.substr(0, pinyin.length - 1);

    // 5 should be 轻声, so no changes needed
    if (accent == "5") {
      return word;
    }

    // Note: accent priority should be in the order aoeiuü
    // Note: in the case of 'iu' or 'ui', accent goes onto the terminal
    //      Ex. liú or guǐ
    // source: http://www.ichineselearning.com/learn/pinyin-tones.html

    var char = "";
    if (word.includes("a")) {
      char = "a";
    } else if (word.includes("A")) {
      char = "A";
    } else if (word.includes("o")) {
      char = "o";
    } else if (word.includes("O")) {
      char = "O";
    } else if (word.includes("e")) {
      char = "e";
    } else if (word.includes("E")) {
      char = "E";
    } else if (word.includes("iu")) {
      char = "u";
    } else if (word.includes("Iu")) {
      char = "u";
    } else if (word.includes("ui")) {
      char = "i";
    } else if (word.includes("Ui")) {
      char = "i";
    } else if (word.includes("i")) {
      char = "i";
    } else if (word.includes("I")) {
      char = "I";
    } else if (word.includes("u:")) {
      // confirmed by hand that u and u: don't appear in the same word
      char = "u:";
    } else if (word.includes("U:")) {
      // confirmed by hand that u and u: don't appear in the same word
      char = "U:";
    } else if (word.includes("u")) {
      char = "u";
    } else if (word.includes("U")) {
      char = "U";
    } else {
      console.error("found pinyin with no vowel: " + pinyin);
    }

    if (vowels[char]) {
      return word
        .replace(char, vowels[char][accent], 1)
        .replace("u:", vowels["u:"]["5"], 1)
        .replace("U:", vowels["U:"]["5"], 1);
    }

    return word;
  }

  function entryDefinition(entry) {
    return entry ? (
      <CardContent variant="helpercard">
        <CardHeader>
          <Typography gutterBottom variant="h5" component="span">
            {entry.simplified}
          </Typography>
          <span style={{ width: "5px" }}></span>
          <Typography gutterBottom variant="subtitle1" component="span">
            {entry.pinyin
              .split(" ")
              .map((pinyin) => parsePinyin(pinyin))
              .join(" ")}
          </Typography>
        </CardHeader>
        <CardBody>
          <ol>
            {entry.english.split("/").map((item, englishIdx) => {
              return (
                <li key={englishIdx}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="left"
                  >
                    {item}
                  </Typography>
                </li>
              );
            })}
          </ol>
        </CardBody>
      </CardContent>
    ) : (
      <CardContent variant="helpercard" />
    );
  }

  function handleNext() {
    setActiveStep((prevStep) => prevStep + 1);
  }

  function handleBack() {
    setActiveStep((prevStep) => prevStep - 1);
  }

  // const step = this.state.activeStep;
  // const maxSteps = this.state.maxSteps;
  // const entries = this.state.entries;

  let entry = entries?.length ? entries[activeStep] : undefined;

  return (
    <Card variant="helpercard">
      {entryDefinition(entry)}
      <CardActions variant="helpercard">
        <MobileStepper
          variant="dots"
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          sx={{
            maxWidth: 345,
            flexGrow: 1,
            backgroundColor: "inherit",
            marginRight: "8px",
            marginLeft: "8px",
          }}
          nextButton={
            <IconButton
              variant="helpercard"
              size="small"
              onClick={handleNext}
              disabled={activeStep === maxSteps - 1}
            >
              <ChevronRightIcon />
            </IconButton>
          }
          backButton={
            <IconButton
              variant="helpercard"
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              <ChevronLeftIcon />
            </IconButton>
          }
        />
      </CardActions>
    </Card>
  );
};

export default HelperCard;
