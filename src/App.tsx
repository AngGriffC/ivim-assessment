import "./styles.scss";
import React, { useState, useEffect } from "react";
import NoteEditor from "./NoteEditor";
import NoteDetails from "./NoteDetails";
import Messages from "./Messages";
import { FaRegStickyNote } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { FaTimesCircle } from "react-icons/fa";
import { FaPlusCircle } from "react-icons/fa";
import { FaSave } from "react-icons/fa";
import { FaPen } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { FaBan } from "react-icons/fa";

// had to add these to prevent invalid type errors
const NoteIcon = FaRegStickyNote as React.ElementType;
const DelIcon = FaTrashAlt as React.ElementType;
const ExitIcon = FaTimesCircle as React.ElementType;
const AddIcon = FaPlusCircle as React.ElementType;
const SaveIcon = FaSave as React.ElementType;
const EditIcon = FaPen as React.ElementType;
const YesIcon = FaCheckCircle as React.ElementType;
const NoIcon = FaBan as React.ElementType;

const CreateNoteButton = (props) => {
  return (
    <button className="CreateNoteButton" onClick={props.onClick}>
      <AddIcon />
      {props.children}
    </button>
  );
};

function dateReformat(originalDate) {
  if (originalDate === "") return "";

  return (
    originalDate.substring(5, 7) +
    "/" +
    originalDate.substring(8, 10) +
    "/" +
    originalDate.substring(0, 4)
  );
}

function Note({ title, date, onNoteClick }) {
  // TODO: add reactivity and clickability to open modal(s)
  return (
    <li className="Note" onClick={onNoteClick}>
      <NoteIcon className="NoteIcon" />
      <span className="NoteTitle">{title}</span>
      &nbsp;
      <span className="NoteDate">{date}</span>
    </li>
  );
}

export default function App() {
  const [noteList, setNoteList] = useState([]);
  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://issessvim.hievilmath.org/api/company/bc38b230-6738-4511-930c-4fc4de109c72/note"
      );
      const result = await response.json();
      setNoteList(result);
    } catch {
      setErrorMessage(true);
      handleSaveClick("", "", "Failed to fetch data from the API");
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const [showNoteEditorModal, setShowNoteEditorModal] = useState(false);
  const [showNoteDetailsModal, setShowNoteDetailsModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [currentNoteKey, setCurrentNoteKey] = useState("empty");
  const [detailsValue, setDetailsValue] = useState(Array(3).fill(""));
  const [editorValue, setEditorValue] = useState(Array(2).fill("test"));
  const [errorMessage, setErrorMessage] = useState(false);
  const [messageValue, setMessageValue] = useState("test");
  const [displayConfirmationButtons, setDisplayConfirmationButtons] =
    useState(false);

  let DetailsLowerRightButtons = (props) => {
    function handleDeletionConfirmClick() {
      setDisplayConfirmationButtons(false);
      setShowNoteDetailsModal(false);
      setShowMessagesModal(true);
      const deletionURL =
        "https://issessvim.hievilmath.org/api/company/bc38b230-6738-4511-930c-4fc4de109c72/note/" +
        currentNoteKey;
      const handleDelete = async () => {
        try {
          const response = await fetch(deletionURL, { method: "DELETE" });
          if (!response.ok) {
            throw new Error("HTTP error! Status: " + response.status);
          }

          setErrorMessage(false);
          setMessageValue("Deleted");
          await fetchData();
        } catch {
          setErrorMessage(true);
          setMessageValue("Failed to delete entry from API");
        }
      };
      handleDelete();
    }
    if (displayConfirmationButtons) {
      return (
        <>
          <YesIcon
            className="DetailYes"
            onClick={() => handleDeletionConfirmClick()}
          />
          <NoIcon
            className="DetailNo"
            onClick={() => setDisplayConfirmationButtons(false)}
          />
        </>
      );
    } else {
      return (
        <>
          <EditIcon
            className="DetailEdit"
            onClick={() => handleEditClick("update")}
          />
          <DelIcon
            className="DetailDelete"
            onClick={() => setDisplayConfirmationButtons(true)}
          />
        </>
      );
    }
  };

  let EditorForms = (props) => {
    const [title, setTitle] = useState(editorValue[0]);
    let titleWarning = "test";
    const [contents, setContents] = useState(editorValue[1]);
    let contentsWarning = "test";

    if (title === "") {
      titleWarning = "Required";
    } else if (title.length < 3) {
      titleWarning = "Must be at least 3 characters";
    } else {
      titleWarning = "";
    }

    if (contents === "") {
      contentsWarning = "Required";
    } else if (contents.length < 3) {
      contentsWarning = "Must be at least 3 characters";
    } else {
      contentsWarning = "";
    }

    return (
      <form>
        <input
          className="EditorInput"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
        <br />
        <div className="Warning">&nbsp;{titleWarning}</div>
        <input
          className="EditorInput"
          type="textarea"
          value={contents}
          onChange={(e) => setContents(e.target.value)}
          placeholder="Note"
        />
        <br />
        <div className="Warning">&nbsp;{contentsWarning}</div>
        <ExitIcon
          onClick={() => setShowNoteEditorModal(false)}
          className="EditorExit"
        />
        <SaveIcon
          className="EditorSave"
          onClick={() => handleSaveClick(title, contents, "")}
        />
      </form>
    );
  };

  let MessageIcon = (props) => {
    if (errorMessage) {
      return <NoIcon />;
    } else {
      return <YesIcon />;
    }
  };

  function handleNoteClick(newKey) {
    setShowNoteDetailsModal(true);
    setCurrentNoteKey(newKey);
    const currentNote = noteList[noteList.findIndex((n) => n.id === newKey)];

    setDetailsValue([
      currentNote.title,
      currentNote.description,
      dateReformat(currentNote.updatedAt ? currentNote.updatedAt : ""),
    ]);
  }

  function handleEditClick(source) {
    setShowNoteDetailsModal(false);
    setShowNoteEditorModal(true);
    if (source === "create") {
      setCurrentNoteKey("empty");
      setEditorValue(["", ""]);
    } else {
      const currentNote =
        noteList[noteList.findIndex((n) => n.id === currentNoteKey)];
      setEditorValue([currentNote.title, currentNote.description]);
    }
  }

  function handleSaveClick(noteTitle, noteContents, apiError) {
    setShowMessagesModal(true);
    if (apiError != "") {
      setMessageValue(apiError);
      return;
    }
    setEditorValue([noteTitle, noteContents]);
    if (noteTitle === "" || noteContents === "") {
      setMessageValue("Both Title and Note are required");
      return;
    }
    if (noteTitle.length < 3 || noteContents.length < 3) {
      setMessageValue("Both Title and Note must be at least 3 characters");
      return;
    }

    setShowNoteEditorModal(false);
    const dataToSend = { title: noteTitle, description: noteContents };

    if (currentNoteKey === "empty") {
      const handlePost = async () => {
        try {
          const response = await fetch(
            "https://issessvim.hievilmath.org/api/company/bc38b230-6738-4511-930c-4fc4de109c72/note",
            {
              headers: { "Content-Type": "application/json" },
              method: "POST",
              mode: "cors",
              body: JSON.stringify(dataToSend),
            }
          );
          if (!response.ok) {
            throw new Error("HTTP error! Status: " + response.status);
          }

          setErrorMessage(false);
          setMessageValue("Created");
          await fetchData();
        } catch {
          setErrorMessage(true);
          setMessageValue("Failed to add new note to API");
        }
      };
      handlePost();
    } else {
      const patchURL =
        "https://issessvim.hievilmath.org/api/company/bc38b230-6738-4511-930c-4fc4de109c72/note/" +
        currentNoteKey;
      const handlePatch = async () => {
        try {
          const response = await fetch(patchURL, {
            headers: { "Content-Type": "application/json" },
            method: "PATCH",
            mode: "cors",
            body: JSON.stringify(dataToSend),
          });
          if (!response.ok) {
            throw new Error("HTTP error! Status: " + response.status);
          }

          setErrorMessage(false);
          setMessageValue("Updated");
          await fetchData();
        } catch {
          setErrorMessage(true);
          setMessageValue("Failed to update note in API");
        }
      };
      handlePatch();
    }
  }

  return (
    <div className="App">
      <div className="Banner">
        <CreateNoteButton onClick={() => handleEditClick("create")} />
        <h1>NOTiV</h1>
      </div>
      <NoteEditor show={showNoteEditorModal} setShow={setShowNoteEditorModal}>
        <EditorForms />
        <br />
      </NoteEditor>
      <NoteDetails
        show={showNoteDetailsModal}
        setShow={setShowNoteDetailsModal}
      >
        <NoteIcon className="NoteIcon" />
        <span className="NoteTitle">{detailsValue[0]}</span>
        <span className="NoteDate">{detailsValue[2]}</span>
        <br />
        <div className="NoteBody">{detailsValue[1]}</div>
        <ExitIcon
          onClick={() => setShowNoteDetailsModal(false)}
          className="DetailExit"
        />
        <DetailsLowerRightButtons />
        <br />
      </NoteDetails>
      <div className="NotesWrapper">
        <ul className="NotesList">
          {noteList.map((note) => {
            return (
              <Note
                key={note.id}
                title={note.title}
                date={dateReformat(note.updatedAt)}
                onNoteClick={() => handleNoteClick(note.id)}
              />
            );
          })}
        </ul>
      </div>
      <Messages show={showMessagesModal} setShow={setShowMessagesModal}>
        <div onClick={() => setShowMessagesModal(false)}>
          <MessageIcon />
          &nbsp; {messageValue}
          <ExitIcon className="MessagesExit" />
        </div>
      </Messages>
    </div>
  );
}
