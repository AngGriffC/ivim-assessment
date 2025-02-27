import "./styles.scss";
import { useEffect, useRef } from "react";

const Messages = (props) => {
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
    <div ref={modalRef} className={`Messages ${props.show ? "active" : ""}`}>
      <div className="Messages__content">{props.children}</div>
    </div>
  );
};

export default Messages;
