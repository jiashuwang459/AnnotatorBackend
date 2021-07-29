import React from "react";
import { List } from "semantic-ui-react";
import styled from "styled-components";
import { Trie } from "./Trie.js";
import { DictionaryStore } from "./DictionaryStore.js";
import { MemoryRouter } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { VariableSizeGrid as Grid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  /* justify-content: center;*/
  /* padding: 20px; */
  position: relative;
  width: 100%;
  height: 100%;
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
  border: green;
  border-style: double;
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
  margin: 5px;
  border: blue;
  border-style: dashed;
  border-width: thin;
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
      values: [],
      // TODO: make a separate memory as a 'change' list, so we can save to the same memory code
      memory: [],
      // text: ""
      dictOverlayTrigger: "",
    };

    // let data = require('./data/data.json');
    // let custom = require('./data/custom.json');
    // let skip = require('./data/skip.json');
    // console.log(data)
    // console.log(custom)
    // console.log(skip)

    // this.trie = new Trie();
    // // priority of data dict is FILO
    // this.dict = new DictionaryStore();

    // // Note: 多音字. currently, dict maps simplified -> list of pinyins.
    // // When fetching, we simply take the first element in list.
    // // (which is hopefully the most common)

    // // To prioritize something, currently just add it to custom.
    // // TODO: think of a better way to handle this?
    // // TODO: possible new feature? have user correct it?
    // //      with our current infrastructure, we can add
    // //      surrounding words into the custom automatically,
    // //      and it can remember that way?

    // //add custom first
    // custom.forEach(entry => {
    //     let key = entry["simplified"]
    //     this.trie.insert(key)
    //     this.dict.add(key, entry);
    // });

    // data.forEach(entry => {
    //     let key = entry["simplified"]
    //     this.trie.insert(key)
    //     this.dict.add(key, entry);
    // });

    // skip.forEach(entry => {
    //     let key = entry["simplified"]
    //     this.trie.insert(key)
    //     if (this.dict.contains(key, entry)) {
    //         if (this.dict.remove(key, entry)) {
    //             //If completely removed from dict, remove from trie
    //             this.trie.remove(key);
    //         }
    //     } else {
    //         console.error("Unrecognized skip");
    //     }
    // });

    // custom.forEach(entry => {
    //     let key = entry["traditional"]
    //     this.trie.insert(key)
    //     this.dict.add(key, entry);
    // });

    // data.forEach(entry => {
    //     let key = entry["traditional"]
    //     this.trie.insert(key)
    //     this.dict.add(key, entry);
    // });

    // skip.forEach(entry => {
    //     let key = entry["traditional"]
    //     this.trie.insert(key)
    //     if (this.dict.contains(key, entry)) {
    //         if (this.dict.remove(key, entry)) {
    //             //If completely removed from dict, remove from trie
    //             this.trie.remove(key);
    //         }
    //     } else {
    //         console.error("Unrecognized skip");
    //     }
    // });

    // this.memory = []; //require('./data/memory.json');

    // this.vowels = require('./data/vowels.json');
    this.setDictMode = this.setDictMode.bind(this);
    this.updateDisplay = this.updateDisplay.bind(this);
    this.updateMemory = this.updateMemory.bind(this);
    this.getMemory = this.getMemory.bind(this);
    this.handleCharacterClick = this.handleCharacterClick.bind(this);
    this.hideBlock = this.hideBlock.bind(this);
    this.rowRenderer = this.rowRenderer.bind(this);
  }

  // /**
  //  * Parses pinyin from ascii to utf-8
  //  *  i.e. from 'san1' into 'sān'
  //  * @param {*} pinyin in ascii
  //  * @returns the proper pinyin, ready to display
  //  */
  // parsePinyin(pinyin) {
  //     if (pinyin == undefined || pinyin == "") {
  //         return ""
  //     }

  //     //special case with no vowel
  //     if (pinyin == "r5") {
  //         return "r";
  //     }

  //     let accent = pinyin[pinyin.length - 1];
  //     var word = pinyin.substr(0, pinyin.length - 1);

  //     // 5 should be 轻声, so no changes needed
  //     if (accent == "5") {
  //         return word;
  //     }

  //     // Note: accent priority should be in the order aoeiuü
  //     // Note: in the case of 'iu' or 'ui', accent goes onto the terminal
  //     //      Ex. liú or guǐ
  //     // source: http://www.ichineselearning.com/learn/pinyin-tones.html

  //     var char = "";
  //     if (word.includes("a")) {
  //         char = "a"
  //     } else if (word.includes("o")) {
  //         char = "o"
  //     } else if (word.includes("e")) {
  //         char = "e"
  //     } else if (word.includes("iu")) {
  //         char = "u"
  //     } else if (word.includes("ui")) {
  //         char = "i"
  //     } else if (word.includes("i")) {
  //         char = "i"
  //     } else if (word.includes("u:")) {
  //         // confirmed by hand that u and u: don't appear in the same word
  //         char = "u:"
  //     } else if (word.includes("u")) {
  //         char = "u"
  //     } else {
  //         console.error("found pinyin with no vowel: " + pinyin);
  //     }

  //     if (this.vowels[char]) {
  //         return word.replace(char, this.vowels[char][accent])
  //     }

  //     return word
  // }

  // isChinese(str) {
  //     // Randomly taken from:
  //     // https://flyingsky.github.io/2018/01/26/javascript-detect-chinese-japanese/
  //     var REGEX_CHINESE = new RegExp(
  //         ['[\\u4e00-\\u9fff]',
  //             '|[\\u3400-\\u4dbf]',
  //             '|[\\u{20000}-\\u{2a6df}]',
  //             '|[\\u{2a700}-\\u{2b73f}]',
  //             '|[\\u{2b740}-\\u{2b81f}]',
  //             '|[\\u{2b820}-\\u{2ceaf}]',
  //             '|[\\uf900-\\ufaff]',
  //             '|[\\u3300-\\u33ff]',
  //             '|[\\ufe30-\\ufe4f]',
  //             '|[\\uf900-\\ufaff]',
  //             '|[\\u{2f800}-\\u{2fa1f}]'].join(''), 'u');
  //     return REGEX_CHINESE.test(str);
  // }

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

  updateDisplay(values) {
    console.log("updateText");
    console.log(values);
    this.setState(
      {
        values: values,
      }
      //   () => {
      //     console.log(this.state);
      //   }
    );
    // this.state.text = e.text;
    // this.refresh();
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
    // this.state.text = e.text;
    // this.refresh();
  }

  getMemory(values) {
    console.log("getting memory");
    console.log(this.state.memory);
    return this.state.memory;
    // console.log("updateText");
    // console.log(values);
    // this.setState(
    //   {
    //     values: values,
    //   },
    //   () => {
    //     console.log(this.state);
    //   }
    // );
    // this.state.text = e.text;
    // this.refresh();
  }

  // refresh = () => {
  //     let text = this.state.text
  //     console.log("===============================")
  //     console.log(text)

  //     var fragments = [text]
  //     fragments = this.split(fragments, '。')
  //     fragments = this.split(fragments, '：')
  //     fragments = this.split(fragments, '？')
  //     fragments = this.split(fragments, ',')
  //     fragments = this.split(fragments, '、')
  //     fragments = this.split(fragments, '“')
  //     fragments = this.split(fragments, '”')
  //     fragments = this.split(fragments, '，')
  //     fragments = this.split(fragments, '）')
  //     fragments = this.split(fragments, '（')
  //     fragments = this.split(fragments, ' ')
  //     fragments = this.split(fragments, '\n')

  //     console.log(fragments);

  //     var lst = [];
  //     for (let fragment of fragments) {
  //         var partial = fragment
  //         while (partial != "") {
  //             var index = 0;
  //             while (partial[index] != undefined && !this.isChinese(partial[index])) {
  //                 index += 1;
  //             } //get rid of all non-chinese char from beginning partial
  //             console.log("++++++++++++++++++++++++");
  //             console.log("partialStart: " + partial);
  //             console.log("index Of first chinese: " + index);
  //             if (partial.substr(0, index) != "") {
  //                 console.log("pushing:" + partial.substr(0, index))
  //                 lst.push({
  //                     pinyin: NBSP,
  //                     cchar: partial.substr(0, index)
  //                 })
  //             }
  //             //remove chars from partial
  //             partial = partial.substr(index, partial.length);
  //             console.log("partialAfterRemoval: '" + partial + "'");

  //             if (partial == "") {
  //                 continue; // no more chinese chars in fragment, next pls
  //             }

  //             //findBest is simply greedy algo, find the longest
  //             var phrase = this.trie.findBest(partial)
  //             console.log("phrase: '" + phrase + "'");
  //             if (phrase == "") {
  //                 console.error("Unable to find best phrase from '" + partial + "'.");
  //                 return; //tentatively return cause error
  //             } else {
  //                 //found something in trie, remove from partial
  //                 partial = partial.substr(phrase.length, partial.length);
  //                 let pinyin = this.dict.getPinYin(phrase).split(" ");
  //                 if (phrase.length != pinyin.length) {
  //                     console.error("pinyin and phrase have different lengths O.o")
  //                     console.error("phrase: " + phrase)
  //                     console.error("pinyin: " + pinyin)
  //                     return; //tentatively return cause error
  //                 }

  //                 // push all phrases
  //                 for (var i = 0; i < phrase.length; i++) {
  //                     lst.push({
  //                         pinyin: this.parsePinyin(pinyin[i]),
  //                         cchar: phrase[i]
  //                     })
  //                 }
  //             }
  //         }
  //     }

  //     this.setState(
  //         {
  //             values: lst,
  //             text: text
  //         },
  //         () => {
  //             console.log(this.state);
  //         },
  //     );
  // }

  handleCharacterClick(item, e) {
    console.log(item);
    console.log(this.state);
    // console.log(this.props.mode);
    // if (this.props.mode != "mem") {
    //   return;
    // }

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
        memory: [...this.state.memory, item],
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

  rowRenderer({ key, index, style }) {
    const values = this.state.values;
    if (entry["cchars"]) {
      // This means it's is a phrase.
      const phrase = entry;

      // TODO: don't change the dom each time.
      //   return this.props.mode == "dict" ?
      return (
        <div>
          <OverlayTrigger
            trigger={this.state.dictOverlayTrigger}
            key={index}
            placement="auto-start"
            rootClose
            disabled
            overlay={
              <Popover id={`popover-positioned-${index}`}>
                <Popover.Header as="h3">
                  {phrase.cchars.map((item) => item.cchar)}
                </Popover.Header>
                <Popover.Body>{phrase.english}</Popover.Body>
              </Popover>
            }
          >
            <PhraseContainer
              key={index}
              //   onClick={(e) => this.handleCharacterClick(item, e)}
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
                      onClick={(e) => this.handleCharacterClick(item, e)}
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
        </div>
      );
    } else {
      const item = entry;
      if (item.cchar == "\n") {
        return (
          <div>
            <NewLineContainer key={index}>
              <Annotation></Annotation>
              <Text></Text>
            </NewLineContainer>
          </div>
        );
      } else {
        return (
          //TODO: add a phrase container?
          <div>
            <CharacterContainer
              key={index}
              onClick={(e) => this.handleCharacterClick(item, e)}
            >
              <Annotation style={this.hideBlock(item)}>
                {item.pinyin}
              </Annotation>
              <Text>{item.cchar}</Text>
            </CharacterContainer>
          </div>
        );
      }
    }
    // return (
    //   <div key={key} style={style}>
    //     {list[index]}
    //   </div>
    // );
  }

  render() {
    const values = this.state.values;
    if (!values?.length) {
      return (
        <Display>
          <p>
            Welcome! Click on the book in the top right corner and enter in what
            you want to annotate to get started!
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
      );
    }
    // console.log(values);
    return (
      <Container>
        {/* <ButtonContainer>
          <MemoryInput></MemoryInput>
          <MemoryButton>Fetch Memory</MemoryButton>
          <MemoryButton>Save Memory</MemoryButton>
        </ButtonContainer> */}
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              rowCount={values.length}
              rowHeight={20}
              rowRenderer={this.rowRenderer}
              width={width}
            />
          )}
        </AutoSizer>
        <Display>
          {values.map((entry, index) => {
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
                  disabled
                  overlay={
                    <Popover id={`popover-positioned-${index}`}>
                      <Popover.Header as="h3">
                        {phrase.cchars.map((item) => item.cchar)}
                      </Popover.Header>
                      <Popover.Body>{phrase.english}</Popover.Body>
                    </Popover>
                  }
                >
                  <PhraseContainer
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
                            onClick={(e) => this.handleCharacterClick(item, e)}
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
      </Container>
    );
  }
}
