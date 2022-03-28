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
  max-height: 200px;
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

const NBSP = "\u00a0";
const HIDDEN = { visibility: "hidden" };

export class DisplayArea extends React.Component {
  constructor(props) {
    super(props);
    this.container = {};
    this.arrow = {};
    this.phrases = {};

    this.state = {
      paragraphs: [],
      // TODO: make a separate memory as a 'change' list, so we can save to the same memory code
      memory: [],
      dictOverlayTrigger: "",
      dictMode: false,
      popperAnchor: null,
      popperPinned: false,
    };

    this.setDictMode = this.setDictMode.bind(this);
    this.updateDisplay = this.updateDisplay.bind(this);
    this.resetDisplay = this.resetDisplay.bind(this);
    this.updateMemory = this.updateMemory.bind(this);
    this.getMemory = this.getMemory.bind(this);
    this.handleCharacterClick = this.handleCharacterClick.bind(this);
    this.hideBlock = this.hideBlock.bind(this);
    // this.rowRenderer = this.rowRenderer.bind(this);
    // this.getPopover = this.getPopover.bind(this);

    this.handlePopoverOpen = this.handlePopoverOpen.bind(this);
    this.handlePopoverClose = this.handlePopoverClose.bind(this);

    this.createPopperCard = this.createPopperCard.bind(this);

    this.handlePopoverAnchorLeave = this.handlePopoverAnchorLeave.bind(this);
    this.handlePopoverAnchorEnter = this.handlePopoverAnchorEnter.bind(this);
    this.handlePopoverLeave = this.handlePopoverLeave.bind(this);
    this.handlePopoverEnter = this.handlePopoverEnter.bind(this);
  }

  handlePopoverOpen(event) {
    console.log("popoverOpen");
    if (this.state.dictMode) {
      const anchor = this.state.popperAnchor;
      const target = event.currentTarget;
      if (anchor === target) {
        return;
      }

      if (anchor) {
        anchor.removeEventListener("mouseenter", this.handlePopoverAnchorEnter);
        anchor.removeEventListener("mouseleave", this.handlePopoverAnchorLeave);
      }

      this.setState({ popperAnchor: target });

      target.addEventListener("mouseenter", this.handlePopoverAnchorEnter);
      target.addEventListener("mouseleave", this.handlePopoverAnchorLeave);
      // onMouseEnter={this.handlePopoverOpen}
      // onMouseLeave={this.handlePopoverClose}
    }

    // this.popover.focus();
  }

  // popoverShow() {
  //   tooltip.setAttribute("data-show", "");

  //   // We need to tell Popper to update the tooltip position
  //   // after we show the tooltip, otherwise it will be incorrect
  //   popperInstance.update();
  // }

  // popoverHide() {
  //   tooltip.removeAttribute("data-show");
  // }

  // handlePopoverHideEvent() {}

  // handlePopoverShowEvent() {
  //   this.popoverShow();
  // }

  // showEvents = ['mouseenter', 'focus'];
  // hideEvents = ['mouseleave', 'blur'];

  // showEvents.forEach((event) => {
  //   button.addEventListener(event, popoverShow);
  // });

  // hideEvents.forEach((event) => {
  //   button.addEventListener(event, popoverHide);
  // });

  handlePopoverClose() {
    console.log("popoverClose");
    if (this.state.dictMode) {
      this.state.popperAnchor.removeEventListener(
        "mouseenter",
        this.handlePopoverAnchorEnter
      );
      this.state.popperAnchor.removeEventListener(
        "mouseleave",
        this.handlePopoverAnchorLeave
      );
      this.setState({ popperAnchor: null });
    }
  }

  handlePopoverAnchorLeave() {
    console.log("popoverRefLeave");
    this.setState({ inPopperAnchor: false });

    if (!this.state.popperPinned && !this.state.inPopper) {
      this.handlePopoverClose();
    }

    // if (this.state.popperLeft) {
    //   this.setState({ popperAnchor: null });
    // }
  }

  handlePopoverAnchorEnter() {
    console.log("popoverRefEnter");
    this.setState({ inPopperAnchor: true });
  }

  handlePopoverLeave() {
    console.log("popoverLeave");
    this.setState({ inPopper: false });

    if (!this.state.popperPinned && !this.state.inPopperAnchor) {
      this.handlePopoverClose();
    }

    // if (this.state.popperLeft) {
    //   this.setState({ popperAnchor: null });
    // }
  }

  handlePopoverEnter() {
    console.log("popoverEnter");
    this.setState({ inPopper: true });
  }

  // split(lines, char) {
  //     var list = [];
  //     for (var line of lines) {
  //         var verses = line.split(char)
  //         for (var i = 0; i < verses.length - 1; i++) {
  //             verses[i] += char
  //         }
  //         list.push(verses);
  //     }
  //     return list.flat()
  // }

  updateDisplay(paragraph) {
    console.log("updateDisplay");
    console.log(paragraph);
    this.setState((state) => {
      return {
        paragraphs: [...state.paragraphs, paragraph],
      };
    });
  }

  resetDisplay() {
    console.log("resetDisplay");
    this.setState({
      paragraphs: [],
    });
  }

  updateMemory(mem) {
    console.log("updateMemory");
    console.log(mem);
    this.setState(
      {
        memory: mem,
      },
      () => {
        console.log(this.state);
      }
    );
  }

  getMemory() {
    console.log("getting memory");
    console.log(this.state.memory);
    return this.state.memory;
  }
  //     fragments = this.split(fragments, '\n')

  handleCharacterClick(item, e) {
    console.log(item);
    console.log(this.state);

    if (this.state.dictMode) {
      return;
    }
    // TODO: doublecheck if this is sufficient in preventing random things
    // from being added to memory.
    // TODO: might need to cchar length check, to accomodate pharses in the future.
    if (item.pinyin == NBSP || item.pinyin == " " || item.cchar.length != 1) {
      return;
    }
    let array = this.state.memory.filter(
      (entry) => entry.pinyin != item.pinyin || entry.cchar != item.cchar
    );

    if (array.length == this.state.memory.length) {
      this.setState({
        memory: [...array, item],
      });
    } else {
      this.setState({
        memory: array,
      });
    }
    // var removing = false;
    // for (let i = 0; i < this.state.memory.length; i++) {
    //   let entry = array[i];
    //   if (entry.pinyin == item.pinyin && entry.cchar == item.cchar) {
    //     console.log("removing");
    //     removing = true;
    //     break;
    //   }
    // }

    // if (removing) {
    //   array.splice(i, 1);
    //   this.setState({
    //     memory: this.state.memory,
    //   });
    //   // this.refresh();
    // } else {
    //   this.setState({
    //     memory: [...array, item],
    //   });
    // }
    // this.refresh();
  }

  // updateButton = (e) => {
  //     console.log("updateButton");
  //     console.log(e);
  // }

  //   handlePhraseClick = (item, e) => {
  //     console.log("phrase click");
  //     console.log(item);
  //     console.log(this.props.mode);
  //     if (this.props.mode != "dict") {
  //       return;
  //     }

  //     // if (array.length == this.state.memory.length) {
  //     //   this.setState({
  //     //     memory: [...this.state.memory, item],
  //     //   });
  //     // } else {
  //     //   this.setState({
  //     //     memory: array,
  //     //   });
  //     // }
  //   };

  hideBlock(item) {
    for (let entry of this.state.memory) {
      if (entry.pinyin == item.pinyin && entry.cchar == item.cchar) {
        return HIDDEN;
      }
    }
    return {};
  }

  setDictMode(mode) {
    console.log("setDictMode");
    console.log(mode);
    this.setState(
      {
        dictMode: mode,
        dictOverlayTrigger: mode ? ["hover", "focus"] : "focus",
      }
      //   () => console.log(this.state)
    );
  }

  createPopperCard() {
    const anchor = this.state.popperAnchor;
    if (!anchor) {
      return;
    }

    paragraphIdx = anchor.dataset.phraseIndex;
    phraseIdx = anchor.dataset.phraseIndex;
    phrase = this.state.paragraphs[paragraphIdx][phraseIdx][0];

    return (
      <Card
        sx={{
          maxWidth: 345,
          borderStyle: "solid",
          borderColor: "dimgrey",
          backgroundColor: "antiquewhite",
        }}
      >
        <CardContent>
          <CardHeader>
            <Typography gutterBottom variant="h5" component="span">
              {phrase.cchars.map((item) => item.cchar).join("")}
            </Typography>
            <span style={{ width: "5px" }}></span>
            <Typography gutterBottom variant="subtitle1" component="span">
              {phrase.cchars.map((item) => item.pinyin).join(" ")}
            </Typography>
            <span
              style={{ flexGrow: 1, paddingRight: "5px", paddingLeft: "5px" }}
            />
            <span>
              {/* <IconButton
                    sx={{
                      borderStyle: "solid",
                      borderWidth: "thin",
                      borderColor: "dimgrey",
                    }}
                    size="small"
                  >
                    <CloseIcon />
                  </IconButton> */}
            </span>
          </CardHeader>
          <CardBody>
            <ol>
              {phrase.english.split("/").map((item, englishIdx) => {
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
        <CardActions
          sx={{
            borderTopStyle: "solid",
            borderTopWidth: "thin",
            borderTopColor: "dimgrey",
          }}
        >
          {/* <Button
              sx={{
                borderStyle: "solid",
                borderWidth: "thin",
                borderColor: "dimgrey",
              }}
              size="small"
            >
              Share
            </Button> */}
          <ToggleButton
            value="check"
            selected={this.state.popperPinned}
            onChange={() => {
              this.setState((state) => {
                return { popperPinned: !state.popperPinned };
              });
            }}
          >
            {this.state.popperPinned ? (
              <PushPinIcon />
            ) : (
              <PushPinOutlinedIcon />
            )}
          </ToggleButton>
          <IconButton
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
          </IconButton>
        </CardActions>
      </Card>
    );
  }

  // getPopover(props, phrase) {
  //   console.log("getPopover");
  //   console.log(props);
  //   console.log(phrase);
  //   // return <div></div>;
  //   return (
  //     <MDBPopover data-mdb-trigger="hover" id={`phrase-popover`} {...props}>
  //       <MDBPopoverHeader tag="h3">
  //         <PopoverCChar>
  //           {phrase.cchars.map((item) => item.cchar).join("")}
  //         </PopoverCChar>
  //         <PopoverPinyin>
  //           {phrase.cchars.map((item) => item.pinyin).join(" ")}
  //         </PopoverPinyin>
  //       </MDBPopoverHeader>
  //       <MDBPopoverBody><ol>{phrase.english.split("/").map((item) => <li>{item}</li>)}</ol></MDBPopoverBody>
  //     </MDBPopover>
  //   );
  // }

  render() {
    const paragraphs = this.state.paragraphs;
    if (!paragraphs?.length) {
      return (
        <Container>
          <Display style={{ textAlign: "initial" }}>
            <p>
              Welcome! Click on the <RiQuillPenFill></RiQuillPenFill> in the top
              right to get started!
            </p>
            <br />
            <br />
            <p>
              A Memory Code is something you can use to keep track of your
              'Knowledge' and the words that you know. Once you've sent in some
              text to be annotated, you will be able to click on each of the
              characters. When you click on a character, I will add it to your
              memory bank. Remember to save your memory bank before you leave!
              Your code will change everytime you save!
            </p>
          </Display>
        </Container>
      );
    }

    // createPopper(this.state.popperAnchor, this.tooltip, {
    //   placement: "bottom",
    //   modifiers: [
    //     {
    //       name: "flip",
    //       options: {
    //         altBoundary: true,
    //         rootBoundary: "viewport",
    //         boundary: this.container,
    //         padding: 8,
    //       },
    //     },
    //     {
    //       name: "preventOverflow",
    //       enabled: true,
    //       options: {
    //         altBoundary: true,
    //         tether: true,
    //         rootBoundary: "viewport",
    //         boundary: this.container,
    //         padding: 8,
    //       },
    //     },
    //     {
    //       name: "arrow",
    //       options: {
    //         padding: 5,
    //       },
    //     },
    //     {
    //       name: "hide",
    //     },
    //   ],
    // });

    //     const rowHeights = new Array(1000)
    //     .fill(true)
    //     .map(() => 25 + Math.round(Math.random() * 50));

    //   const getItemSize = index => rowHeights[index];

    //   const Row = ({ index, style }) => (
    //     <div style={style}>Row {index}</div>
    //   );

    //   const Example = () => (
    //     <List
    //       height={150}
    //       itemCount={1000}
    //       itemSize={getItemSize}
    //       width={300}
    //     >
    //       {Row}
    //     </List>
    //   );
    const open = this.state.dictMode ? Boolean(this.state.popperAnchor) : false;

    return (
      <Container ref={(container) => (this.container = container)}>
        <Virtuoso
          style={{ height: "100%", width: "100%" }}
          data={paragraphs}
          totalCount={paragraphs.length}
          itemContent={(paragraphIndex, paragraph) => {
            // const paragraph = paragraphs[paragraphIndex];
            return (
              <Display key={paragraphIndex}>
                {paragraph.map((entry, phraseIndex) => {
                  if (entry.cchars) {
                    // This means it's is a phrase.
                    const phrase = entry;

                    // TODO: don't change the dom each time.
                    //   return this.props.mode == "dict" ?
                    return (
                      // 'auto-start' | 'auto' | 'auto-end' | 'top-start' | 'top' | 'top-end' | 'right-start' | 'right' | 'right-end' | 'bottom-end' | 'bottom' | 'bottom-start' | 'left-end' | 'left' | 'left-start'
                      // <OverlayTrigger
                      //   trigger={this.state.dictOverlayTrigger}
                      //   key={index}
                      //   placement="auto-start"
                      //   rootClose
                      //   overlay={(props) => this.getPopover(props, phrase)}
                      // >
                      // <MDBPopover
                      //   options={{ 'data-mdb-trigger': "hover", container: 'body' }}
                      //   btnChildren={

                      //   }
                      // >
                      //   <MDBPopoverHeader tag="h3">
                      //     <PopoverCChar>{phrase.cchars.map((item) => item.cchar).join("")}</PopoverCChar>
                      //     <PopoverPinyin>{phrase.cchars.map((item) => item.pinyin).join(" ")}</PopoverPinyin>
                      //   </MDBPopoverHeader>
                      //   <MDBPopoverBody><ol>{phrase.english.split("/").map((item) => <li>{item}</li>)}</ol></MDBPopoverBody>
                      // </MDBPopover>
                      // <div>
                      <PhraseContainer
                        className={
                          phrase.cchars.length > 1 && this.state.dictMode
                            ? "dictionary_outline"
                            : "dictionary_no_outline"
                        }
                        key={phraseIndex}
                        // onClick={(e) => this.handleCharacterClick(item, e)}
                        aria-owns={open ? "tooltip" : undefined}
                        // onMouseEnter={this.handlePopoverOpen}
                        // onMouseLeave={this.handlePopoverClose}
                        data-cchars={phrase.cchars
                          .map((item) => item.cchar)
                          .join("")}
                        data-pinyin={phrase.cchars
                          .map((item) => item.pinyin)
                          .join(" ")}
                        data-english={phrase.english}
                        data-paragraph={paragraphIndex}
                        data-phrase={phraseIndex}
                        onClick={(e) => {
                          this.handlePopoverOpen(e);
                          // console.log(this.cardContent);
                          // }
                        }}
                      >
                        {phrase.cchars.map((item, ccharIndex) => {
                          if (item.cchar == "\n") {
                            return (
                              <NewLineContainer key={ccharIndex}>
                                <Annotation></Annotation>
                                <Text></Text>
                              </NewLineContainer>
                            );
                          } else {
                            return (
                              <CharacterContainer
                                key={ccharIndex}
                                onClick={(e) =>
                                  this.handleCharacterClick(item, e)
                                }
                              >
                                <Annotation style={this.hideBlock(item)}>
                                  {item.pinyin}
                                </Annotation>
                                <Text>{item.cchar}</Text>
                              </CharacterContainer>
                            );
                          }
                        })}
                      </PhraseContainer>
                      // </div>
                    );
                    //   ) : (
                    //     <PhraseContainer key={index}>
                    //       {phrase.cchars.map((item, index2) => {
                    //         if (item.cchar == "\n") {
                    //           return (
                    //             <NewLineContainer key={index2}>
                    //               <Annotation></Annotation>
                    //               <Text></Text>
                    //             </NewLineContainer>
                    //           );
                    //         } else {
                    //           return (
                    //             //TODO: add a phrase container?
                    //             <CharacterContainer
                    //               key={index2}
                    //               onClick={(e) => this.handleCharacterClick(item, e)}
                    //             >
                    //               <Annotation style={this.hideBlock(item)}>
                    //                 {item.pinyin}
                    //               </Annotation>
                    //               <Text>{item.cchar}</Text>
                    //             </CharacterContainer>
                    //           );
                    //         }
                    //       })}
                    //     </PhraseContainer>
                    //   );
                  } else {
                    const item = entry;
                    if (item.cchar == "\n") {
                      return (
                        <NewLineContainer key={phraseIndex}>
                          <Annotation></Annotation>
                          <Text></Text>
                        </NewLineContainer>
                      );
                    } else {
                      return (
                        <CharacterContainer
                          key={phraseIndex}
                          onClick={(e) => this.handleCharacterClick(item, e)}
                        >
                          <Annotation style={this.hideBlock(item)}>
                            {item.pinyin}
                          </Annotation>
                          <Text>{item.cchar}</Text>
                        </CharacterContainer>
                      );
                    }
                  }
                })}
              </Display>
            );
          }}
        ></Virtuoso>
        <Popper
          id={"tooltip"}
          open={open}
          anchorEl={this.state.popperAnchor}
          placement={"bottom"}
          // style={{
          //   borderStyle: "solid",
          //   borderColor: "dimgrey",
          //   backgroundColor: "antiquewhite",
          // }}
          modifiers={[
            {
              name: "flip",
              options: {
                altBoundary: true,
                rootBoundary: "viewport",
                boundary: this.container,
                padding: 8,
              },
            },
            {
              name: "preventOverflow",
              enabled: true,
              options: {
                altBoundary: true,
                tether: true,
                rootBoundary: "viewport",
                boundary: this.container,
                padding: 8,
              },
            },
            // {
            //   name: "arrow",
            //   options: {
            //     padding: 5,
            //   },
            // },
            {
              name: "hide",
            },
          ]}
          onClose={this.handlePopoverClose}
          onMouseLeave={this.handlePopoverLeave}
          onMouseEnter={this.handlePopoverEnter}
          // disableRestoreFocus
        >
          {this.createPopperCard()}
          {/* <div id={"arrow"} data-popper-arrow=""></div> */}
        </Popper>
      </Container>
    );

    //TODO: figure out popper arrow
    // figure out popper scrolling out of bounds.
    // popper iterate through phrases.
    // popper make a correction?
    //

    // return (
    //   <Container>
    //     {paragraphs.map((paragraph, paragraphIndex) => {
    //       return (
    //         <Display key={paragraphIndex}>
    //           {paragraph.map((entry, index) => {
    //             if (entry["cchars"]) {
    //               // This means it's is a phrase.
    //               const phrase = entry;

    //               // TODO: don't change the dom each time.
    //               //   return this.props.mode == "dict" ?
    //               return (
    //                 // 'auto-start' | 'auto' | 'auto-end' | 'top-start' | 'top' | 'top-end' | 'right-start' | 'right' | 'right-end' | 'bottom-end' | 'bottom' | 'bottom-start' | 'left-end' | 'left' | 'left-start'
    //                 <OverlayTrigger
    //                   trigger={this.state.dictOverlayTrigger}
    //                   key={index}
    //                   placement="auto-start"
    //                   rootClose
    //                   overlay={(props) => this.getPopover(props, phrase)}
    //                 >
    //                   <PhraseContainer
    //                     key={index}
    //                     // onClick={(e) => this.handleCharacterClick(item, e)}
    //                   >
    //                     {phrase.cchars.map((item, index2) => {
    //                       if (item.cchar == "\n") {
    //                         return (
    //                           <NewLineContainer key={index2}>
    //                             <Annotation></Annotation>
    //                             <Text></Text>
    //                           </NewLineContainer>
    //                         );
    //                       } else {
    //                         return (
    //                           //TODO: add a phrase container?
    //                           <CharacterContainer
    //                             key={index2}
    //                             onClick={(e) =>
    //                               this.handleCharacterClick(item, e)
    //                             }
    //                           >
    //                             <Annotation style={this.hideBlock(item)}>
    //                               {item.pinyin}
    //                             </Annotation>
    //                             <Text>{item.cchar}</Text>
    //                           </CharacterContainer>
    //                         );
    //                       }
    //                     })}
    //                   </PhraseContainer>
    //                 </OverlayTrigger>
    //               );
    //               //   ) : (
    //               //     <PhraseContainer key={index}>
    //               //       {phrase.cchars.map((item, index2) => {
    //               //         if (item.cchar == "\n") {
    //               //           return (
    //               //             <NewLineContainer key={index2}>
    //               //               <Annotation></Annotation>
    //               //               <Text></Text>
    //               //             </NewLineContainer>
    //               //           );
    //               //         } else {
    //               //           return (
    //               //             //TODO: add a phrase container?
    //               //             <CharacterContainer
    //               //               key={index2}
    //               //               onClick={(e) => this.handleCharacterClick(item, e)}
    //               //             >
    //               //               <Annotation style={this.hideBlock(item)}>
    //               //                 {item.pinyin}
    //               //               </Annotation>
    //               //               <Text>{item.cchar}</Text>
    //               //             </CharacterContainer>
    //               //           );
    //               //         }
    //               //       })}
    //               //     </PhraseContainer>
    //               //   );
    //             } else {
    //               const item = entry;
    //               if (item.cchar == "\n") {
    //                 return (
    //                   <NewLineContainer key={index}>
    //                     <Annotation></Annotation>
    //                     <Text></Text>
    //                   </NewLineContainer>
    //                 );
    //               } else {
    //                 return (
    //                   //TODO: add a phrase container?
    //                   <CharacterContainer
    //                     key={index}
    //                     onClick={(e) => this.handleCharacterClick(item, e)}
    //                   >
    //                     <Annotation style={this.hideBlock(item)}>
    //                       {item.pinyin}
    //                     </Annotation>
    //                     <Text>{item.cchar}</Text>
    //                   </CharacterContainer>
    //                 );
    //               }
    //             }
    //           })}
    //         </Display>
    //       );
    //     })}
    //   </Container>
    // );
  }
}
