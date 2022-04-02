import React, { Component, useEffect } from "react";
// import styled from "styled-components";
import { DisplayArea } from "./DisplayArea";
import { Annotation } from "./Annotation";
import { Memory } from "./Memory";
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
import { Grid } from "@mui/material";
// import { TextArea } from "semantic-ui-react";
import styled from "styled-components";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Popover from "react-bootstrap/Popover";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Overlay from "react-bootstrap/Overlay";
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import FloatingLabel from "react-bootstrap/FloatingLabel";
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

const TextArea = styled.textarea`
  resize: vertical;
  flex: auto;
  overflow-y: auto;
  min-height: 50px;
  max-height: 150px;
`;
const MemoryInput = styled.input``;

const Display = styled.div`
  display: flex;
  width: 100%;
  padding: 10px;
  flex-direction: column;
  overflow-y: auto;
`;

const Form = styled.form`
  padding: 10px;
`;

const DefinitionView = styled.div`
  display: flex;
  flex-direction: column;
  border: cyan;
  border-style: solid;
  margin: 5px;
  padding: 5px;
  gap: 5px;
  font-size: large;
`;

const DefinitionHeader = styled.div`
  display: flex;
  flex-direction: row;
  gap: 5px;
`;
const CCharView = styled.div``;
const PinyinView = styled.div``;
const EnglishView = styled.div``;

const IndividualView = styled.div`
  border: blue;
  border-style: solid;
`;

const IndividualViewHeader = styled.h3`
  margin: 5px;
`;
const IndividualCharView = styled.div`
  border: chartreuse;
  border-style: solid;
  margin: 5px;
`;

const NBSP = "\u00a0";

export default class DictionaryPage extends Component {
  constructor(props) {
    super(props);
    this.state = { cchars: "", definitions: [], individual: [] };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.vowels = require("../../../data/vowels.json");
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    console.log("submit button clicked");
    console.log(this.state.cchars);
    // alert("You are submitting " + this.state.cchars);

    // const requestOptions = {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // };

    var params = new URLSearchParams({
      phrase: this.state.cchars,
    });

    // fetch("/api/entry?" + params.toString(), requestOptions)
    //   .then((response) => response.json())
    //   .then((data) => {
    //     this.setState(
    //       {
    //         definitions: data,
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
            definitions: data,
          },
          () => {
            console.log(data);
          }
        );
      });

    var manyEntries = [];
    for (var cchar of this.state.cchars) {
      console.log("looking at cchar: " + cchar);
      // const requestOptions = {
      //   method: "GET",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // };

      var params = new URLSearchParams({
        phrase: cchar,
      });

      // var response = await fetch(
      //   "/api/entry?" + params.toString(),
      //   requestOptions
      // );
      // const json = await response.json();

      const response = await axios.get("/api/entry?" + params.toString());
      const json = response.data;

      console.log(json);
      manyEntries.push(json);
    }
    console.log(manyEntries);

    this.setState({ individual: manyEntries }, () => console.log(manyEntries));
  };

  handleChange(e) {
    let name = e.target.name;
    let val = e.target.value;

    this.setState({ [name]: val });
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

  createDefinitionView(entry, index) {
    console.log("Definition view: ");
    console.log(entry);
    return (
      <DefinitionView key={index}>
        <DefinitionHeader>
          <CCharView>{entry.simplified}</CCharView>
          <PinyinView>
            {entry.pinyin
              .split(" ")
              .map((pinyin) => this.parsePinyin(pinyin))
              .join(" ")}
          </PinyinView>
        </DefinitionHeader>
        <EnglishView>{entry.english}</EnglishView>
      </DefinitionView>
    );
  }

  createIndividualCharView = async () => {
    if (this.state.cchars.length == 1) {
      return "";
    }

    // var manyEntries = [];
    // for (var cchar of this.state.cchars) {

    //   manyEntries += json;
    // }
    return (
      <IndividualView>
        {this.state.cchars.map(async (cchar, idx) => {
          console.log("looking at cchar: " + cchar);
          // const requestOptions = {
          //   method: "GET",
          //   headers: {
          //     "Content-Type": "application/json",
          //   },
          // };

          var params = new URLSearchParams({
            phrase: cchar,
          });

          // var response = await fetch(
          //   "/api/entry?" + params.toString(),
          //   requestOptions
          // );
          const response = await axios.get("/api/entry?" + params.toString());
          const charEntries = response.data;
          // const charEntries = await response.json();
          return (
            <IndividualCharView key={idx}>
              {charEntries.map((charEntry, idx2) =>
                this.createDefinitionView(charEntry, idx2)
              )}
            </IndividualCharView>
          );
        })}
      </IndividualView>
    );
  };

  render() {
    let definitions = this.state.definitions;
    return (
      <Container>
        <Form onSubmit={this.handleSubmit}>
          <h1>Lookup Chinese in Dictionary</h1>
          <p>Enter Chinese: </p>
          <input type="text" name="cchars" onChange={this.handleChange} />
          <input type="submit" />
        </Form>
        <Display>
          {definitions.map((entry, index) =>
            this.createDefinitionView(entry, index)
          )}

          {this.state.individual.length === 0 ? (
            ""
          ) : (
            <Collapsible trigger="Individual Chars" transitionTime={200} open>
              <IndividualView>
                {this.state.individual.map((ccharEntries, idx) => (
                  <IndividualCharView key={idx}>
                    {ccharEntries.map((charEntry, idx2) =>
                      this.createDefinitionView(charEntry, idx2)
                    )}
                  </IndividualCharView>
                ))}
              </IndividualView>
            </Collapsible>
          )}
        </Display>
      </Container>
    );
  }

  //   constructor(props) {
  //     super(props);
  //     this.display = {};
  //     this.annotation = {};
  //     this.memory = {};
  //     this.fetchOverlay = {};

  //     this.state = {
  //       text: "",
  //       loading: false,
  //       dictionaryMode: false,
  //       dictEdit: false,
  //     };

  //     this.handleClose = this.handleClose.bind(this);
  //     this.handleShow = this.handleShow.bind(this);
  //     this.handleAnnotate = this.handleAnnotate.bind(this);
  //     this.handleFetchMemory = this.handleFetchMemory.bind(this);
  //     this.handleGetMemoryFragments = this.handleGetMemoryFragments.bind(this);
  //     this.handleCloseAnnotation = this.handleCloseAnnotation.bind(this);
  //     this.handleDictEditToggle = this.handleDictEditToggle.bind(this);
  //     this.handleDictionaryModeToggle =
  //       this.handleDictionaryModeToggle.bind(this);
  //   }

  //   handleAnnotate = async (text) => {
  //     this.setState(
  //       {
  //         loading: true,
  //         text: text,
  //         show: false,
  //       },
  //       async () => {
  //         try {
  //           this.display.resetDisplay();

  //           var paragraphs = text.split("\n");
  //           for (var i = 0; i < paragraphs.length - 1; i++) {
  //             paragraphs[i] += "\n";
  //           }

  //           for (var paragraph of paragraphs) {
  //             console.log(paragraph);
  //             if (paragraph == "") {
  //               this.display.updateDisplay([]);
  //               continue;
  //             }
  //             const requestOptions = {
  //               method: "POST",
  //               headers: {
  //                 "Content-Type": "application/json",
  //               },
  //               body: JSON.stringify({
  //                 text: paragraph,
  //               }),
  //             };

  //             const response = await fetch("/api/annotate", requestOptions);
  //             const json = await response.json();
  //             console.log(json);
  //             await this.display.updateDisplay(json);
  //             // .then((response) => {
  //             //   console.log(response.status);
  //             //   if (!response.ok) {
  //             //     throw new Error("HTTP status " + response.status);
  //             //   }
  //             //   return response.json();
  //             // })
  //             // .then((data) => {
  //             //   console.log(data); //TODO： validation for all data
  //             //   this.display.updateDisplay(data);
  //             // });
  //           }
  //         } finally {
  //           this.setState({
  //             loading: false,
  //           });
  //         }
  //       }
  //     );
  //   };

  //   handleGetMemoryFragments(){
  //     return this.display.getMemory()
  //   }

  //   handleFetchMemory(fragments) {
  //     this.display.updateMemory(fragments);
  //   }

  //   handleShow() {
  //     console.log("show");
  //     this.setState({
  //       show: true,
  //     });
  //   }

  //   handleClose() {
  //     console.log("close");
  //     this.setState({
  //       show: false,
  //     });
  //   }

  //   handleCloseAnnotation(text) {
  //     console.log("closeAnnotation");
  //     this.setState({
  //       text: text,
  //     });
  //   }

  //   handleDictionaryModeToggle(e) {
  //     console.log("dictionary mode toggle");
  //     console.log(e);
  //     this.setState(
  //       {
  //         dictionaryMode: e.currentTarget.checked,
  //       },
  //       () => {
  //         // console.log(this.state);
  //         this.display.setDictMode(this.state.dictionaryMode);
  //       }
  //     );
  //   }

  //   handleDictEditToggle(e) {
  //     console.log("dictionary edit toggle");
  //     console.log(e);
  //     this.setState(
  //       {
  //         dictEdit: e.currentTarget.checked,
  //       },
  //       () => {
  //         // console.log(this.state);
  //         this.display.setDictEdit(this.state.dictEdit);
  //       }
  //     );
  //   }

  //   render() {
  //     return (
  //       <Grid
  //         container
  //         spacing={1}
  //         alignItems="flex-start"
  //         style={{ padding: "10px", flexWrap: "nowrap" }}
  //         direction="column"
  //       >
  //         <Grid item>
  //           <Input>
  //           </Input>
  //         </Grid>
  //         <Grid container style={{ height: "100%", overflowY: "hidden" }}>
  //           <Grid item xs align="center" style={{ height: "100%" }}>
  //             <DisplayArea
  //               ref={(d) => (this.display = d)}
  //               // mode={this.state.displayMode}
  //             />
  //           </Grid>
  //         </Grid>
  //       </Grid>
  //     );
  //   }
}
