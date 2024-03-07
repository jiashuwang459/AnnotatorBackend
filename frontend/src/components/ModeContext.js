import React from "react";

import { createContext, useContext, useReducer } from "react";

const ModeContext = createContext(null);
const ModeDispatchContext = createContext(null);

const ModeProvider = ({ children }) => {
  const [mode, dispatch] = useReducer(modeReducer, initialMode);

  return (
    <ModeContext.Provider value={mode}>
      <ModeDispatchContext.Provider value={dispatch}>
        {children}
      </ModeDispatchContext.Provider>
    </ModeContext.Provider>
  );
};

function modeReducer(mode, action) {
  //TODO: update these actions.

  switch (action.type) {
    case "dict": {
      return {
        ...mode,
        readMode: false,
        dictMode: true,
        editMode: false,
      };
    }
    case "edit": {
      return {
        ...mode,
        readMode: false,
        dictMode: false,
        editMode: true,
      };
    }
    case "read": {
      return {
        ...mode,
        readMode: true,
        dictMode: false,
        editMode: false,
      };
    }
    case "error": {
      return {
        ...mode,
        readMode: true,
        dictMode: false,
        editMode: false,
      };
    }
    //TODO: add more cases.
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

const initialMode = {
  readMode: true,
  dictMode: false,
  editMode: false,
};

export function useMode() {
  return useContext(ModeContext);
}

export function useModeDispatch() {
  return useContext(ModeDispatchContext);
}

export default ModeProvider;
