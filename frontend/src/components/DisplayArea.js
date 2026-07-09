import React from "react";

import Grid from "@mui/material/Unstable_Grid2";
import Box from "@mui/material/Box";
import { useAnnotations } from "./AnnotationContext";
import CCharacter from "./CCharacter";
import Phrase from "./Phrase";
import Paragraph from "./Paragraph";
import Stack from "@mui/material/Stack";
import { Virtuoso } from "react-virtuoso";
import Paper from "@mui/material/Paper";

const DisplayArea = () => {
  const annotations = useAnnotations();

  const paragraphs = annotations.paragraphs;

  //TODO: aug 10. just got displaying stuff to work
  // - will have to do more work for memory
  // - add hiding pinyin.
  // - add better spacing for empty new lines.
  //

  return (
    <Paper variant="display" sx={{ p: 1 }}>
      <Virtuoso
        components={{
          Item: ({ children, ...props }) => <Box {...props}>{children}</Box>,
        }}
        style={{ height: "100%", width: "100%" }}
        data={paragraphs}
        totalCount={paragraphs.length}
        itemContent={(paragraphIndex, paragraph) => {
          return <Paragraph key={paragraphIndex} paragraph={paragraph} />;
        }}
      ></Virtuoso>
    </Paper>
  );
};

export default DisplayArea;
