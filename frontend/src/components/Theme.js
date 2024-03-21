import { createTheme } from "@mui/material/styles";

const defaultTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#fdf5e6",
    },
    secondary: {
      main: "#8add5d",
    },
    background: {
      paper: "#fdf5e6",
    },
  },
});

const MyTheme = {
  palette: {
    primary: {
      main: "#4fc3f7",
    },
    secondary: {
      main: "#8add5d",
    },
    yellow: {
      light: "#fdf6e8",
      main: "#FBE7C6",
      dark: "#ffc66b",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    mint: {
      main: "#B4F8C8",
    },
    blue: {
      light: "#F0F8FF",
      main: "#A0E7E5",
      dark: "#8bc7ff",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    pink: {
      light: "#fff0f8",
      main: "#ffd8ec",
      dark: "#ff669c",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    paper: {
      light: "#fff7f0",
      main: "#f3ddd0",
      dark: "#d4ad92",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    purple: {
      light: "#f7f0ff",
      main: "#eadaff",
      dark: "#c18dfe",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    nice: {
      main: "#ccff90",
    },
  },
  components: {
    MuiPaper: {
      variants: [
        {
          props: { variant: "newline" },
          style: {
            // textTransform: "none",
            border: `1px dashed`,
            borderColor: "transparent",
            backgroundColor: "transparent",
            margin: "3px",
            //margin: "4px",
          },
        },
        {
          props: { variant: "character" },
          style: {
            // textTransform: "none",
            // border: `2px dashed ${blue[500]}`,
            position: "relative",
            margin: "2px",
            backgroundColor: "transparent",
          },
        },
        {
          props: {variant: "clickcharacter"},
          style: {
            position: "absolute",
            height: "50%",
            width: "50%",
            backgroundColor: "transparent",
            // backgroundColor: "blueviolet",
            transform: "translate(50%,50%)",
          },
        },
        {
          props: { variant: "annotation" },
          style: {
            // textTransform: "none",
            // border: `2px dashed ${blue[500]}`,
            textAlign: "center",
            fontSize: "small",
            //backgroundColor: "lavender",
            backgroundColor: "transparent",
          },
        },
        {
          props: { variant: "annotation_hidden" },
          style: {
            // textTransform: "none",
            // border: `2px dashed ${blue[500]}`,
            textAlign: "center",
            fontSize: "small",
            //backgroundColor: "lavender",
            backgroundColor: "transparent",
            color: "transparent",
          },
        },
        {
          props: { variant: "cchar" },
          style: {
            // alignItems: "center",
            textAlign: "center",
            fontSize: "x-large",
            //backgroundColor: "aquamarine",
            backgroundColor: "transparent",
          },
        },
        {
          props: { variant: "display" },
          style: {
            height: "100%",
            width: "100%",
            textAlign: "initial",
            backgroundColor: "#fdf6e8",
            borderWidth: "1px",
            borderColor: "darkgoldenrod",
            borderStyle: "solid",
          },
        },
        {
          props: { variant: "paragraph" },
          style: {
            display: "flex",
            width: "100%",
            flexDirection: "row",
            flexWrap: "wrap",
            overflowY: "auto",
            borderWidth: "1px",
            borderColor: "transparent",
            borderStyle: "solid",
            backgroundColor: "transparent",
            // margin: "2px",
            // gap: "4px",
            // border: `2px dashed ${blue[500]}`,
          },
        },
        {
          props: { variant: "phrase" },
          style: {
            // textTransform: "none",
            backgroundColor: "transparent",
            border: `1px dashed`,
            borderColor: "transparent",
            margin: "1px",
            // margin: "2px",
            gap: "4px",
            display: "flex",
          },
        },
        {
          props: { variant: "popover" },
          style: {
            // textTransform: "none",
            backgroundColor: "greenyellow",
            backgroundColor: "transparent",
            border: `1px dashed`,
            borderColor: "green",
            borderColor: "transparent",
            margin: "1px",
            padding: "2px",
            gap: "4px",
            display: "flex",
            minWidth: "50%",
            maxHeight: "40%",
            textAlign: "center",
            flexDirection: "column",
          },
        },
        {
          props: { variant: "phrase_outlined" },
          style: {
            // textTransform: "none",
            border: `1px dashed ${defaultTheme.palette.secondary.light}`,
            backgroundColor: "aliceblue",
            margin: "1px",
            // margin: "2px",
            gap: "4px",
            display: "flex",
          },
        },
      ],
    },
    MuiCard: {
      variants: [
        {
          props: { variant: "helpercard" },
          style: {
            width: 270,
            borderStyle: "solid",
            borderColor: "dimgrey",
            backgroundColor: "antiquewhite",
          },
        },
      ],
    },
    MuiCardActions: {
      variants: [
        {
          props: { variant: "helpercard" },
          style: {
            borderTopStyle: "solid",
            borderTopWidth: "thin",
            borderTopColor: "dimgrey",
          },
        },
      ],
    },
    MuiIconButton: {
      variants: [
        {
          props: { variant: "helpercard" },
          style: {
            borderStyle: "solid",
            borderWidth: "thin",
            borderColor: "dimgrey",
          },
        },
      ],
    },
    MuiCardContent: {
      variants: [
        {
          props: { variant: "helpercard" },
          style: {
            height: "282px",
          },
        },
      ],
    },
  },
};

export const DebugTheme = {
  palette: {
    primary: {
      main: "#4fc3f7",
    },
    secondary: {
      main: "#8add5d",
    },
    yellow: {
      light: "#fdf6e8",
      main: "#FBE7C6",
      dark: "#ffc66b",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    mint: {
      main: "#B4F8C8",
    },
    blue: {
      light: "#F0F8FF",
      main: "#A0E7E5",
      dark: "#8bc7ff",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    pink: {
      light: "#fff0f8",
      main: "#ffd8ec",
      dark: "#ff669c",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    paper: {
      light: "#fff7f0",
      main: "#f3ddd0",
      dark: "#d4ad92",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    purple: {
      light: "#f7f0ff",
      main: "#eadaff",
      dark: "#c18dfe",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    nice: {
      main: "#ccff90",
    },
  },
  components: {
    MuiPaper: {
      variants: [
        {
          props: { variant: "newline" },
          style: {
            // textTransform: "none",
            border: `1px dashed`,
            backgroundColor: "transparent",
            borderColor: "blue",
            margin: "3px",
            //margin: "4px",
          },
        },
        {
          props: { variant: "character" },
          style: {
            // textTransform: "none",
            // border: `2px dashed ${blue[500]}`,
            margin: "2px",
            backgroundColor: "transparent",
          },
        },
        {
          props: { variant: "annotation" },
          style: {
            // textTransform: "none",
            // border: `2px dashed ${blue[500]}`,
            textAlign: "center",
            fontSize: "small",
            backgroundColor: "lavender",
            // backgroundColor: "transparent",
          },
        },
        {
          props: { variant: "annotation_hidden" },
          style: {
            // textTransform: "none",
            // border: `2px dashed ${blue[500]}`,
            textAlign: "center",
            fontSize: "small",
            //backgroundColor: "lavender",
            backgroundColor: "transparent",
            color: "transparent",
          },
        },
        {
          props: { variant: "cchar" },
          style: {
            // alignItems: "center",
            textAlign: "center",
            fontSize: "x-large",
            // backgroundColor: "aquamarine",
            backgroundColor: "transparent",
          },
        },
        {
          props: { variant: "display" },
          style: {
            height: "100%",
            width: "100%",
            textAlign: "initial",
            backgroundColor: "#fdf6e8",
            borderWidth: "1px",
            borderColor: "darkgoldenrod",
            borderStyle: "solid",
          },
        },
        {
          props: { variant: "paragraph" },
          style: {
            display: "flex",
            width: "100%",
            flexDirection: "row",
            flexWrap: "wrap",
            overflowY: "auto",
            borderWidth: "1px",
            borderColor: "green",
            borderStyle: "solid",
            backgroundColor: "transparent",
            // margin: "2px",
            // gap: "4px",
            // border: `2px dashed ${blue[500]}`,
          },
        },
        {
          props: { variant: "phrase" },
          style: {
            // textTransform: "none",
            border: `1px dashed`,
            borderColor: "orange",
            margin: "1px",
            // margin: "2px",
            gap: "4px",
            display: "flex",
            // backgroundColor: "transparent",
            backgroundColor: "aliceblue",
          },
        },
        {
          props: { variant: "phrase_outline" },
          style: {
            // textTransform: "none",
            border: `1px dashed ${defaultTheme.palette.secondary.light}`,
            backgroundColor: "aliceblue",
            margin: "1px",
            // color: defaultTheme.palette.secondary.main,
            gap: "4px",
            display: "flex",
            flexDirection: "row",
          },
        },
      ],
    },
  },
};

export default MyTheme;
