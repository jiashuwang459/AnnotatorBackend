import React from "react";

import Grid from "@mui/material/Unstable_Grid2";
import Box from "@mui/material/Box";
import { useAnnotations } from "./AnnotationContext";
import Stack from "@mui/material/Stack";
import { Virtuoso } from "react-virtuoso";
import Paper from "@mui/material/Paper";
import Phrase from "./Phrase";

// TODO: maybe change the returned pharse.cchars to return phrase.fchars
const Paragraph = (props) => {
  const paragraph = props.paragraph;

  if (paragraph.length == 0) {
    return (
      <Paper variant="paragraph" {...props}>
        nothing to see here
      </Paper>
    );
  } else {
    return (
      <Paper variant="paragraph" {...props}>
        {paragraph.map((entry, phraseIndex) => {
          return <Phrase key={phraseIndex} phrase={entry} />;
        })}
      </Paper>
    );
  }
};

export default Paragraph;
