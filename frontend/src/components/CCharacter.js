import React, { useState, useEffect } from "react";

import Grid from "@mui/material/Unstable_Grid2";
import Box from "@mui/material/Box";
import { useAnnotations } from "./AnnotationContext";
import Stack from "@mui/material/Stack";
import { Virtuoso } from "react-virtuoso";
import Paper from "@mui/material/Paper";

// TODO: feb 27, 2024. add a context for memory, and maybe a reducer for hiding stuffs.
// https://react.dev/learn/scaling-up-with-reducer-and-context

const CCharacter = (props) => {
  const [view, setView] = useState(false);
  const fchar = props.fchar;
  const memory = props.memory;


  useEffect(() => {},[view]);

  function handleCharacterClick(e) {
    console.log("click char", fchar)
  }

  function annotationVarient() {
    if(fchar && memory) {
      for (const entry of memory) {
        if (entry.pinyin == item.pinyin && entry.cchar == item.cchar) {
          return "annotation_hidden"
        }
      }
    }
    return "annotation"
  }

  if (fchar) {
    return (
      <Paper
        variant="character"
        {...props}
        onClick={handleCharacterClick}
      >
        <Paper variant={annotationVarient()}>{fchar.pinyin}</Paper>
        <Paper variant="cchar">{fchar.cchar}</Paper>
      </Paper>
    );
  } else {
    return (
      <Paper variant="newline" {...props}>
        <Paper variant="annotation"></Paper>
        <Paper variant="cchar"></Paper>
      </Paper>
    );
  }
};

export default CCharacter;
