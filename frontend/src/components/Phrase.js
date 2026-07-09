import React, { useState, useMemo } from "react";

import Grid from "@mui/material/Unstable_Grid2";
import Box from "@mui/material/Box";
import { useAnnotations } from "./AnnotationContext";
import Stack from "@mui/material/Stack";
import { Virtuoso } from "react-virtuoso";
import Paper from "@mui/material/Paper";
import CCharacter from "./CCharacter";
import ControlledPhrase from "./ControlledPhrase";
import { useMode } from "./ModeContext";
import { useMemory } from "./MemoryContext";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import {
  useFloating,
  useInteractions,
  useHover,
  useFocus,
  autoUpdate,
} from "@floating-ui/react";
import { computePosition, autoPlacement, arrow } from "@floating-ui/dom";
import NBSP from "./Utils";

// TODO: doublecheck if this is sufficient in preventing random things
// from being added to memory.
// TODO: might need to cchar length check, to accomodate pharses in the future???
const emptyFCHAR = (fchar) => {
  return (
    fchar.pinyin == NBSP ||
    fchar.pinyin == " " ||
    fchar.cchar == "\n" ||
    fchar.cchar.length != 1
  );
};

// TODO: maybe change the returned pharse.cchars to return phrase.fchars
const Phrase = React.forwardRef((props, ref) => {
  // const [isOpen, setIsOpen] = useState(false);
  // const { refs, floatingStyles, context } = useFloating({
  //   open: isOpen,
  //   onOpenChange: setIsOpen,
  //   middleware: [autoPlacement()],
  //   whileElementsMounted: autoUpdate,
  // });

  // const click = useClick(context);

  // const { getReferenceProps, getFloatingProps } = useInteractions([
  //   click,
  //   // dismiss,
  //   // role,
  // ]);

  // const cleanup = autoUpdate(referenceEl, floatingEl, () => {
  //   computePosition(referenceEl, floatingEl).then(({ x, y }) => {
  //     // ...
  //   });
  // });

  //cleanup

  // computePosition(refs.reference, refs.floating, {
  //   middleware: [autoPlacement()
  //     arrow({element: arrowElement})
  //   ],
  // });

  const phrase = props.phrase;

  const mode = useMode();
  const dictMode = mode.dictMode;

  const memory = useMemory();

  const phraseVarient = useMemo(
    () => (dictMode ? "phrase_outlined" : "phrase"),
    [dictMode]
  );

  function showAnnotation(fchar) {
    if (!fchar) {
      return "show";
    }

    if (emptyFCHAR(fchar)) {
      return "hide";
    }

    if (fchar && memory) {
      // TODO: maybe change this to a hash, so no need to loop lookup.
      for (const entry of memory.fragments) {
        if (entry.pinyin == fchar.pinyin && entry.cchar == fchar.cchar) {
          return "hide";
        }
      }
    }
    return "show";
  }

  // function handleClickPhrase() {
  //   console.log("click phrase", isOpen);
  //   setIsOpen(!isOpen);
  // }

  if (phrase.cchars) {
    // This means it's is a phrase.
    return (
      // <div>
      <Paper
        // ref={refs.setReference}
        variant={phraseVarient}
        // onClick={handleClickPhrase}
        // {...getReferenceProps()}
        {...props}
        ref={ref}
      >
        {phrase.cchars.map((fchar, ccharIndex) => {
          return (
            <CCharacter
              key={ccharIndex}
              fchar={fchar.cchar == "\n" ? "" : fchar}
              annotate={showAnnotation(fchar)}
            />
          );
        })}
      </Paper>
      //   {/* {isOpen && (
      //     <FloatingFocusManager context={context} modal={false}>
      //       <div
      //         ref={refs.setFloating}
      //         style={floatingStyles}
      //         {...getFloatingProps()}
      //       >
      //         Popover element
      //       </div>
      //     </FloatingFocusManager>
      //   )} */}
      // {/* </div> */}
    );
  } else {
    const fchar = phrase;
    return (
      <Paper variant="phrase" {...props} ref={ref}>
        <CCharacter
          key={0}
          fchar={fchar.cchar == "\n" ? "" : fchar}
          annotate={showAnnotation(fchar)}
        />
      </Paper>
    );
  }
});

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
