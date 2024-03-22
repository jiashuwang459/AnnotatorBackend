import React, { useState, useEffect, memo, useMemo } from "react";

import Grid from "@mui/material/Unstable_Grid2";
import Box from "@mui/material/Box";
import { useMemoryDispatch, useMemory } from "./MemoryContext";
import Stack from "@mui/material/Stack";
import { Virtuoso } from "react-virtuoso";
import Paper from "@mui/material/Paper";
import NBSP from "./Utils";
import { useMode } from "./ModeContext";

// TODO: feb 27, 2024. add a context for memory, and maybe a reducer for hiding stuffs.
// https://react.dev/learn/scaling-up-with-reducer-and-context

// TODO: optimize displaying/hiding the annotations... right now every character on the page get's rerendered.

// TODO: doublecheck if this is sufficient in preventing random things
// from being added to memory.
// TODO: might need to cchar length check, to accomodate pharses in the future???
const emptyFCHAR = (fchar) => {
  return fchar.pinyin == NBSP || fchar.pinyin == " " || fchar.cchar.length != 1;
};

const CCharacter = memo(function CCharacter(props) {
  const [view, setView] = useState(true);
  const fchar = props.fchar;
  const annotate = props.annotate === "show";

  const dispatch = useMemoryDispatch();
  const memory = useMemory();

  const mode = useMode();
  const readMode = mode.readMode;
  const editMode = mode.editMode;

  function handleCharacterClick(e) {
    //console.log("click char", fchar);
    if (!readMode) {
      return;
    }

    if (emptyFCHAR(fchar)) {
      return;
    }

    const fragments = memory.fragments.filter(
      (entry) => entry.pinyin != fchar.pinyin || entry.cchar != fchar.cchar
    );

    const add_fchar = fragments.length == memory.fragments.length;

    if (add_fchar) {
      dispatch({ type: "add", fchar: fchar });
      setView(false);
    } else {
      dispatch({ type: "remove", fchar: fchar, fragments: fragments });
      setView(true);
    }
  }

  // function annotationVarient() {
  //   //console.log(fchar, memory);
  //   if(annotates) {
  //     return "annotation"
  //   } else {
  //     return "annotation_hidden"
  //   }
  // }

  const annotationVarient = annotate ? "annotation" : "annotation_hidden";

  if (fchar) {
    return (
      <Paper variant="character" {...props}>
        <Paper
          variant={editMode ? "clickcharacter_debug" : "clickcharacter"}
          onClick={handleCharacterClick}
        />
        <Paper variant={annotationVarient}>{fchar.pinyin}</Paper>
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
});

export default CCharacter;
