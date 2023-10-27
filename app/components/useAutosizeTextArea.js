import { useEffect } from "react";

const useAutosizeTextArea = (textAreaRef, value) => {
  useEffect(() => {
    if (!!textAreaRef) {
      textAreaRef.style.height = "0px";
      const scrollHeight = textAreaRef.scrollHeight;
      textAreaRef.style.height = scrollHeight + 2 + "px";
    }
  }, [textAreaRef, value]);
};

export default useAutosizeTextArea;
