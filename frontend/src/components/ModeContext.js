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
        dictMode: true,
        editMode: false,
      };
    }
    case "edit": {
      return {
        ...mode,
        dictMode: false,
        editMode: true,
      };
    }
    case "read": {
      return {
        ...mode,
        dictMode: false,
        editMode: false,
      };
    }
    case "error": {
      return {
        ...mode,
        code: -1,
      };
    }
    //TODO: add more cases.
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

const initialMode = {
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
