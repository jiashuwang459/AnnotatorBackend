import * as React from "react";
import { List } from "semantic-ui-react";
import styled from "styled-components";
import { MemoryRouter } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { MDBPopover, MDBPopoverBody, MDBPopoverHeader } from "mdb-react-ui-kit";
import Typography from "@mui/material/Typography";
import { Button, CardActionArea, CardActions } from "@mui/material";
import MyButton from "react-bootstrap/Button";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
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

export default class HelperCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      entries: [],
      maxSteps: 0,
      curStep: 0,
    };

    this.setPhrase = this.setPhrase.bind(this);
    this.parsePinyin = this.parsePinyin.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.handleNext = this.handleNext.bind(this);

    this.setPhrase(props.phrase);

    this.vowels = require("../../../data/vowels.json");

    // this.updateDisplay = this.updateDisplay.bind(this);
    // this.resetDisplay = this.resetDisplay.bind(this);
  }

  // updateDisplay(paragraph) {
  //   console.log("updateDisplay");
  //   console.log(paragraph);
  //   this.setState((state) => {
  //     return {
  //       paragraphs: [...state.paragraphs, paragraph],
  //     };
  //   });
  // }

  // resetDisplay() {
  //   console.log("resetDisplay");
  //   this.setState({
  //     paragraphs: [],
  //   });
  // }

  setPhrase(phrase) {
    console.log("setPhrase");
    console.log(phrase);

    // alert("You are submitting " + this.state.cchars);

    // const requestOptions = {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // };

    var params = new URLSearchParams({
      phrase: phrase.cchars.map((item) => item.cchar).join(""),
    });

    // fetch("/api/entry?" + params.toString(), requestOptions)
    //   .then((response) => response.json())
    //   .then((data) => {
    //     this.setState(
    //       {
    //         entries: data,
    //         maxSteps: data.length,
    //       },
    //       () => {
    //         console.log(data);
    //       }
    //     );
    //   });

    axios
      .get("/api/entry?" + params.toString())
      .then((response) => response.data)
      .then((data) => {
        this.setState(
          {
            entries: data,
            maxSteps: data.length,
          },
          () => {
            console.log(data);
          }
        );
      });
  }

  handleNext() {
    this.setState((state) => {
      return { curStep: state.curStep + 1 };
    });
  }

  handleBack() {
    this.setState((state) => {
      return { curStep: state.curStep - 1 };
    });
  }

  /**
   * Parses pinyin from ascii to utf-8
   *  i.e. from 'san1' into 'sān'
   * @param {*} pinyin in ascii, ex. san1
   * @returns the proper pinyin, ready to display, ex. sān
   */
  parsePinyin(pinyin) {
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

    if (this.vowels[char]) {
      return word
        .replace(char, this.vowels[char][accent], 1)
        .replace("u:", this.vowels["u:"]["5"], 1)
        .replace("U:", this.vowels["U:"]["5"], 1);
    }

    return word;
  }

  entryDefinition(entry) {
    return entry ? (
      <CardContent sx={{ height: "282px" }}>
        <CardHeader>
          <Typography gutterBottom variant="h5" component="span">
            {entry.simplified}
          </Typography>
          <span style={{ width: "5px" }}></span>
          <Typography gutterBottom variant="subtitle1" component="span">
            {entry.pinyin
              .split(" ")
              .map((pinyin) => this.parsePinyin(pinyin))
              .join(" ")}
          </Typography>
        </CardHeader>
        <CardBody>
          <ol>
            {entry.english.split("/").map((item, englishIdx) => {
              return (
                <li key={englishIdx}>
                  <Typography variant="body2" color="text.secondary">
                    {item}
                  </Typography>
                </li>
              );
            })}
          </ol>
        </CardBody>
      </CardContent>
    ) : (
      <div style={{ height: "282px" }}></div>
    );
  }

  render() {
    // const paragraphs = this.state.paragraphs;
    // if (!paragraphs?.length) {
    //   return (
    //     <Container>
    //       <Display style={{ textAlign: "initial" }}>
    //         <p>
    //           Welcome! Click on the <RiQuillPenFill></RiQuillPenFill> in the top
    //           right to get started!
    //         </p>
    //         <br />
    //         <br />
    //         <p>
    //           A Memory Code is something you can use to keep track of your
    //           'Knowledge' and the words that you know. Once you've sent in some
    //           text to be annotated, you will be able to click on each of the
    //           characters. When you click on a character, I will add it to your
    //           memory bank. Remember to save your memory bank before you leave!
    //           Your code will change everytime you save!
    //         </p>
    //       </Display>
    //     </Container>
    //   );
    // }
    console.log("render");

    const step = this.state.curStep;
    const maxSteps = this.state.maxSteps;
    const entries = this.state.entries;

    let entry = undefined;
    if (entries?.length) {
      entry = entries[step];
    }

    return (
      <Card
        sx={{
          width: 270,
          borderStyle: "solid",
          borderColor: "dimgrey",
          backgroundColor: "antiquewhite",
        }}
      >
        {this.entryDefinition(entry)}
        <CardActions
          sx={{
            borderTopStyle: "solid",
            borderTopWidth: "thin",
            borderTopColor: "dimgrey",
          }}
        >
          <ToggleButton
            value="check"
            selected={this.state.popperPinned}
            onChange={() => {
              this.setState(
                (state) => {
                  return { popperPinned: !state.popperPinned };
                },
                () => {
                  this.props.onPinned(this.state.popperPinned);
                }
              );
            }}
          >
            {this.state.popperPinned ? (
              <PushPinIcon />
            ) : (
              <PushPinOutlinedIcon />
            )}
          </ToggleButton>

          <MobileStepper
            variant="dots"
            steps={maxSteps}
            position="static"
            activeStep={step}
            sx={{
              maxWidth: 345,
              flexGrow: 1,
              backgroundColor: "inherit",
              marginRight: "8px",
              marginLeft: "8px",
            }}
            nextButton={
              <IconButton
                sx={{
                  borderStyle: "solid",
                  borderWidth: "thin",
                  borderColor: "dimgrey",
                }}
                size="small"
                onClick={this.handleNext}
                disabled={step === maxSteps - 1}
              >
                <ChevronRightIcon />
              </IconButton>
            }
            backButton={
              <IconButton
                size="small"
                onClick={this.handleBack}
                sx={{
                  borderStyle: "solid",
                  borderWidth: "thin",
                  borderColor: "dimgrey",
                }}
                disabled={step === 0}
              >
                <KeyboardArrowLeftIcon />
              </IconButton>
            }
          />
          {/* <IconButton
            sx={{
              borderStyle: "solid",
              borderWidth: "thin",
              borderColor: "dimgrey",
            }}
            size="small"
          >
            <KeyboardArrowLeftIcon />
          </IconButton>
          <IconButton
            sx={{
              borderStyle: "solid",
              borderWidth: "thin",
              borderColor: "dimgrey",
            }}
            size="small"
          >
            <ChevronRightIcon />
          </IconButton> */}
        </CardActions>
      </Card>
    );

    //TODO: figure out popper arrow (not really worth it for me.)
    // popper iterate through phrases.
    // popper make a correction?
    //
  }
}
