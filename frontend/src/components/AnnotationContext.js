import React from "react";

import { createContext, useContext, useReducer } from 'react';

const AnnotationContext = createContext(null);
const AnnotationDispatchContext = createContext(null);

const AnnotationProvider = ({children}) => {
  const [annotations, dispatch] = useReducer(
    annotationReducer,
    initialAnnotations
  );
  
  return (
    <AnnotationContext.Provider value={annotations}>
    <AnnotationDispatchContext.Provider
      value={dispatch}
    >
      {children}
    </AnnotationDispatchContext.Provider>
  </AnnotationContext.Provider>
  );
};

function annotationReducer(annotations, action) {
  //TODO: update these actions.
  //
  // An Annotation has the following shape:
  // {
  //   text: "你好大家， 我的名字不会告诉你哦~。"
  // }
  //
  //


  switch (action.type) {
    case 'fetch_book': {
      return {
        ...annotations,
        loading: true
      };
    }
    case 'fetch': {
      return {
        ...annotations,
        sourceText: action.sourceText,
        paragraphs: [],
        loading: true
      };
    }
    case 'add': {
      return {
        ...annotations,
        paragraphs: [...annotations.paragraphs, action.content]
      };
    }
    case 'error' : {
      return {
        ...annotations,
        sourceText: error
      }
    }
    case 'done': {
      return {
        ...annotations,
        loading: false
      };
    }
    //TODO: add more cases.
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

const initialAnnotations = {
  sourceText: "Hellos",
  loading: false,
  paragraphs: []
};

export function useAnnotations() {
  return useContext(AnnotationContext);
}

export function useAnnotationDispatch() {
  return useContext(AnnotationDispatchContext);
}

export default AnnotationProvider;
