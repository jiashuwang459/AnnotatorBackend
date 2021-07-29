import React from "react";
import { List } from "semantic-ui-react";
import styled from "styled-components";
import { Trie } from "./Trie.js";
import { DictionaryStore } from "./DictionaryStore.js";
import { MemoryRouter } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { Virtuoso } from "react-virtuoso";

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
`;

const ButtonContainer = styled.div`
  display: flex;
  width: 70%;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 5px;
`;

const TextArea = styled.textarea`
  resize: vertical;
  flex: auto;
  overflow: scroll;
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
`;

const Annotation = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
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
    this.state = {
      paragraphs: [],
      // TODO: make a separate memory as a 'change' list, so we can save to the same memory code
      memory: [],
      dictOverlayTrigger: "",
    };

    this.setDictMode = this.setDictMode.bind(this);
    this.updateDisplay = this.updateDisplay.bind(this);
    this.resetDisplay = this.resetDisplay.bind(this);
    this.updateMemory = this.updateMemory.bind(this);
    this.getMemory = this.getMemory.bind(this);
    this.handleCharacterClick = this.handleCharacterClick.bind(this);
    this.hideBlock = this.hideBlock.bind(this);
    // this.rowRenderer = this.rowRenderer.bind(this);
    this.getPopover = this.getPopover.bind(this);
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

  getPopover(props, phrase) {
    console.log("getPopover");
    console.log(props);
    console.log(phrase);
    // return <div></div>;
    return (
      <Popover id={`phrase-popover`} {...props}>
        <Popover.Header as="h3">
          {phrase.cchars.map((item) => item.cchar)}
        </Popover.Header>
        <Popover.Body>{phrase.english}</Popover.Body>
      </Popover>
    );
  }

  render() {
    const paragraphs = this.state.paragraphs;
    if (!paragraphs?.length) {
      return (
        <Container>
          <Display>
            <p>
              Welcome! Click on the book in the top right corner and enter in
              what you want to annotate to get started!
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

    return (
      <Container>
        <Virtuoso
          style={{ height: "100%", width: "100%" }}
          data={paragraphs}
          totalCount={paragraphs.length}
          itemContent={(idx, paragraph) => {
            // const paragraph = paragraphs[idx];
            return (
              <Display class="jiashu" key={idx}>
                {paragraph.map((entry, index) => {
                  if (entry["cchars"]) {
                    // This means it's is a phrase.
                    const phrase = entry;

                    // TODO: don't change the dom each time.
                    //   return this.props.mode == "dict" ?
                    return (
                      // 'auto-start' | 'auto' | 'auto-end' | 'top-start' | 'top' | 'top-end' | 'right-start' | 'right' | 'right-end' | 'bottom-end' | 'bottom' | 'bottom-start' | 'left-end' | 'left' | 'left-start'
                      <OverlayTrigger
                        trigger={this.state.dictOverlayTrigger}
                        key={index}
                        placement="auto-start"
                        rootClose
                        overlay={(props) => this.getPopover(props, phrase)}
                      >
                        <PhraseContainer
                          className={
                            this.state.dictMode
                              ? "jiashu_outline"
                              : "jiashu_no_outline"
                          }
                          key={index}
                          // onClick={(e) => this.handleCharacterClick(item, e)}
                        >
                          {phrase.cchars.map((item, index2) => {
                            if (item.cchar == "\n") {
                              return (
                                <NewLineContainer key={index2}>
                                  <Annotation></Annotation>
                                  <Text></Text>
                                </NewLineContainer>
                              );
                            } else {
                              return (
                                //TODO: add a phrase container?
                                <CharacterContainer
                                  key={index2}
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
                      </OverlayTrigger>
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
                        <NewLineContainer key={index}>
                          <Annotation></Annotation>
                          <Text></Text>
                        </NewLineContainer>
                      );
                    } else {
                      return (
                        //TODO: add a phrase container?
                        <CharacterContainer
                          key={index}
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
      </Container>
    );

    // return (
    //   <Container>
    //     {paragraphs.map((paragraph, idx) => {
    //       return (
    //         <Display key={idx}>
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
