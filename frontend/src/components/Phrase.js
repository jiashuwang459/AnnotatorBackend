import React from "react";

import Grid from "@mui/material/Unstable_Grid2";
import Box from "@mui/material/Box";
import { useAnnotations } from "./AnnotationContext";
import Stack from "@mui/material/Stack";
import { Virtuoso } from "react-virtuoso";
import Paper from "@mui/material/Paper";
import CCharacter from "./CCharacter";
import { useMode } from "./ModeContext";

// TODO: maybe change the returned pharse.cchars to return phrase.fchars
const Phrase = (props) => {
  const phrase = props.phrase;

  const mode = useMode();
  const dictMode = mode.dictMode;

  function phraseVarient() {
    if (dictMode) {
      return "phrase_outlined";
    } else {
      return "phrase";
    }
  }

  if (phrase.cchars) {
    // This means it's is a phrase.
    return (
      <Paper variant={phraseVarient()} {...props}>
        {phrase.cchars.map((fchar, ccharIndex) => {
          return (
            <CCharacter
              key={ccharIndex}
              fchar={fchar.cchar == "\n" ? "" : fchar}
            />
          );
        })}
      </Paper>
    );
  } else {
    const fchar = phrase;
    return (
      <Paper variant="phrase" {...props}>
        <CCharacter key={0} fchar={fchar.cchar == "\n" ? "" : fchar} />
      </Paper>
    );
  }
};

// data-cchars={phrase.cchars
//   .map((item) => item.cchar)
//   .join("")}
// data-pinyin={phrase.cchars
//   .map((item) => item.pinyin)
//   .join(" ")}
// data-english={phrase.english}
// data-paragraph={paragraphIndex}
// data-phrase={phraseIndex}

export default Phrase;
