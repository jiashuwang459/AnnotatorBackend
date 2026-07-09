import React from "react";

import { createContext, useContext, useReducer } from "react";

const MemoryContext = createContext(null);
const MemoryDispatchContext = createContext(null);

const MemoryProvider = ({ children }) => {
  const [memory, dispatch] = useReducer(memoryReducer, initialMemory);

  return (
    <MemoryContext.Provider value={memory}>
      <MemoryDispatchContext.Provider value={dispatch}>
        {children}
      </MemoryDispatchContext.Provider>
    </MemoryContext.Provider>
  );
};

// TODO: maybe add a stack and undo button?
// TODO: maybe add a place to view all known words, or get stats on memory.

function memoryReducer(memory, action) {
  //TODO: update these actions.
  // A memory has the following shape:
  // {
  //   {
  //     "code": 2,
  //     "fragments": [
  //         {
  //             "pinyin": "de",
  //             "cchar": "的"
  //         },
  //         {
  //             "pinyin": "zi",
  //             "cchar": "子"
  //         },
  //         {
  //             "pinyin": "hái",
  //             "cchar": "孩"
  //         },
  //         {
  //             "pinyin": "duì",
  //             "cchar": "对"
  //         },
  //         {
  //             "pinyin": "zhe",
  //             "cchar": "着"
  //         },
  //         {
  //             "pinyin": "dài",
  //             "cchar": "带"
  //         }
  //     ]
  // }
  // }
  //
  //

  switch (action.type) {
    case "init": {
      return {
        ...memory,
        code: action.code,
        fragments: [],
        loading: true,
      };
    }
    case "set": {
      return {
        ...memory,
        code: action.code,
        fragments: [...action.fragments],
      };
    }
    case "save": {
      return {
        ...memory,
        code: action.code,
      };
    }
    // case "toggle": {
    //   const fchar = action.fchar;
    //   const fragments = memory.fragments.filter(
    //     (entry) => entry.pinyin != fchar.pinyin || entry.cchar != fchar.cchar
    //   );

    //   const remove_fchar = fragments.length == memory.fragments.length;
    //   return {
    //     ...memory,
    //     fragments: remove_fchar ? fragments : [...memory.fragments, fchar],
    //   };
    // }
    case "add": {
      // console.log("memory add", "fchar", action.fchar);
      return {
        ...memory,
        fragments: [...memory.fragments, action.fchar],
      };
    }
    case "remove": {
      // console.log("memory remove", "fchar", action.fchar);
      return {
        ...memory,
        fragments: [...action.fragments],
      };
    }
    case "error": {
      return {
        ...memory,
        code: -1,
      };
    }
    case "done": {
      return {
        ...memory,
        loading: false,
      };
    }
    //TODO: add more cases.
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

const initialMemory = {
  code: 0,
  loading: false,
  fragments: [],
};

export function useMemory() {
  return useContext(MemoryContext);
}

export function useMemoryDispatch() {
  return useContext(MemoryDispatchContext);
}

export default MemoryProvider;
