import "./styles.scss";
import { useEffect, useRef } from "react";

const NoteEditor = (props) => {
  const modalRef = useRef();

  useEffect(() => {
    const clickOutsideContent = (e) => {
      if (e.target === modalRef.current) {
        props.setShow(false);
      }
    };
    window.addEventListener("click", clickOutsideContent);
    return () => {
      window.removeEventListener("click", clickOutsideContent);
    };
  }, [props]);

  return (
    <div ref={modalRef} className={`NoteEditor ${props.show ? "active" : ""}`}>
      <div className="NoteEditor__content">{props.children}</div>
    </div>
  );
};

export default NoteEditor;
