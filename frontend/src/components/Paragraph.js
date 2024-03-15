import React from "react";

import Grid from "@mui/material/Unstable_Grid2";
import Box from "@mui/material/Box";
import { useAnnotations } from "./AnnotationContext";
import Stack from "@mui/material/Stack";
import { Virtuoso } from "react-virtuoso";
import Paper from "@mui/material/Paper";
import Phrase from "./Phrase";
import { useMode } from "./ModeContext";
import ControlledPhrase from "./ControlledPhrase";

// TODO: maybe change the returned pharse.cchars to return phrase.fchars
const Paragraph = (props) => {
  const paragraph = props.paragraph;

  const mode = useMode();
  const dictMode = mode.dictMode;

  if (paragraph.length == 0) {
    return <Paper variant="paragraph" {...props} />;
  } else {
    return (
      <Paper variant="paragraph" {...props}>
        {paragraph.map((entry, phraseIndex) => {
          // Only make it a controlled phrase if dictmode is on.
          // And if so, only add control if it's actually a cchar.
          if (dictMode && entry.cchars) {
            return <ControlledPhrase key={phraseIndex} phrase={entry} />;
          } else {
            return <Phrase key={phraseIndex} phrase={entry} />;
          }
        })}
      </Paper>
    );
  }
};

export default Paragraph;
