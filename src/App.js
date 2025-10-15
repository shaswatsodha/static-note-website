// src/App.js

import React, { useState, useEffect } from "react";
import "./App.css";

// ----------------------------------------------------
// 1. DEFINE BASE_URL
// Reads from REACT_APP_BACKEND_URL in the .env file.
// Falls back to http://localhost:5000 for local development if the variable is not set.
const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
// ----------------------------------------------------

const CustomAlert = ({ message, onClose }) => (
  <div className="custom-alert-overlay">
    <div className="custom-alert-box">
      <p>{message}</p>
      <button onClick={onClose} className="button-style login-button">
        OK
      </button>
    </div>
  </div>
);

const LoginPage = ({ email, setEmail, password, setPassword, handleLogin, setPage }) => (
  <div className="container-box center-text margin-top-100">
    <h2 className="page-title-blue">Login</h2>
    <input
      className="input-field"
      type="email"
      placeholder="Enter Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
    <input
      className="input-field"
      type="password"
      placeholder="Enter Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
    <button className="button-style login-button" onClick={handleLogin}>
      Login
    </button>
    <p className="margin-top-20">
      Don’t have an account?{" "}
      <span className="link-style" onClick={() => setPage("signup")}>
        Signup
      </span>
    </p>
  </div>
);

const SignupPage = ({ email, setEmail, password, setPassword, handleSignup, setPage }) => (
  <div className="container-box center-text margin-top-100">
    <h2 className="page-title-green">Signup</h2>
    <input
      className="input-field"
      type="email"
      placeholder="Enter Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
    <input
      className="input-field"
      type="password"
      placeholder="Enter Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
    <button className="button-style signup-button" onClick={handleSignup}>
      Signup
    </button>
    <p className="margin-top-20">
      Already have an account?{" "}
      <span className="link-style-green" onClick={() => setPage("login")}>
        Login
      </span>
    </p>
  </div>
);

const NotesApp = ({ email, setPage }) => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [notePassword, setNotePassword] = useState("");
  const [passwordPrompt, setPasswordPrompt] = useState({ noteId: null, title: "" });
  const [enteredPassword, setEnteredPassword] = useState("");

  useEffect(() => {
    refreshNotes();
  }, [email]);

  const refreshNotes = async () => {
    try {
      // 2. Updated Fetch Call
      const res = await fetch(`${BASE_URL}/getnotes/${email}`);
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || (isPrivate && !notePassword.trim())) return;
    try {
      if (editId) {
        // 3. Updated Fetch Call
        await fetch(`${BASE_URL}/updatenote/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, private: isPrivate, notePassword }),
        });
      } else {
        // 4. Updated Fetch Call
        await fetch(`${BASE_URL}/addnote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: email, title, content, private: isPrivate, notePassword }),
        });
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    }
    setTitle("");
    setContent("");
    setIsPrivate(false);
    setNotePassword("");
    setEditId(null);
    setShowForm(false);
    refreshNotes();
  };

  const handleDelete = async (id) => {
    try {
      // 5. Updated Fetch Call
      await fetch(`${BASE_URL}/deletenote/${id}`, { method: "DELETE" });
      setNotes(notes.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const handleEditClick = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setIsPrivate(note.private);
    setEditId(note._id);
    setShowForm(true);
  };

  const handleNewNoteClick = () => {
    setTitle("");
    setContent("");
    setIsPrivate(false);
    setNotePassword("");
    setEditId(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setIsPrivate(false);
    setNotePassword("");
    setEditId(null);
    setShowForm(false);
  };

  const filteredNotes = notes.filter(
    (note) => note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="notes-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="main-app-title">Notes App</h1>
          <p className="logged-in-text">Logged in as {email}</p>
        </div>
        <div className="header-actions">
          <button
            className="button-style new-note-button"
            onClick={handleNewNoteClick}
            disabled={showForm}
          >
            New Note
          </button>
          <button
            className="button-style logout-button"
            onClick={() => setPage("login")}
          >
            Logout
          </button>
        </div>
      </header>
      <div className="search-bar">
        <input
          type="text"
          className="input-field"
          placeholder="Search notes by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {selectedNote && (
        <div className="custom-alert-overlay">
          <div className="custom-alert-box" style={{ textAlign: "left" }}>
            <h2>{selectedNote.title}</h2>
            <p style={{ whiteSpace: "pre-line", marginTop: "15px" }}>
              {selectedNote.content}
            </p>
            <button
              className="button-style cancel-button"
              style={{ marginTop: "20px" }}
              onClick={() => setSelectedNote(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showForm && (
        <div className="note-form container-box">
          <h2>{editId ? "Edit Note" : "Add New Note"}</h2>
          <input
            className="input-field"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {!isPrivate && (
            <textarea
              className="input-field"
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          )}
          <label style={{ display: "block", marginTop: "10px" }}>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />{" "}
            Private Note
          </label>
          {isPrivate && (
            <input
              className="input-field"
              type="password"
              placeholder="Set Note Password"
              value={notePassword}
              onChange={(e) => setNotePassword(e.target.value)}
            />
          )}
          <div className="form-actions-footer">
            <button className="button-style cancel-button" onClick={handleCancel}>
              Cancel
            </button>
            <button
              className="button-style add-button"
              onClick={handleSave}
              disabled={!title.trim() || (isPrivate && !notePassword.trim())}
            >
              {editId ? "Update Note" : "Save Note"}
            </button>
          </div>
        </div>
      )}
      {passwordPrompt.noteId && (
        <div className="custom-alert-overlay">
          <div className="custom-alert-box">
            <h3>Enter password for "{passwordPrompt.title}"</h3>
            <input
              className="input-field"
              type="password"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              placeholder="Note Password"
            />
            <button
              className="button-style unlock-button"
              onClick={async () => {
                try {
                  // 6. Updated Fetch Call
                  const res = await fetch(`${BASE_URL}/checknote/${passwordPrompt.noteId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password: enteredPassword }),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setSelectedNote({ title: passwordPrompt.title, content: data.content });
                    setPasswordPrompt({ noteId: null, title: "" });
                    setEnteredPassword("");
                  } else {
                    alert("Wrong password!");
                  }
                } catch {
                  alert("Error checking password");
                }
              }}
            >
              Unlock
            </button>

            <button
              className="button-style cancel-button"
              onClick={() => {
                setPasswordPrompt({ noteId: null, title: "" });
                setEnteredPassword("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <h2 className="section-title">Your Notes</h2>
      {filteredNotes.length === 0 ? (
        <div className="no-notes-message">
          <p>No notes found.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className="note-card"
              onClick={() => {
                if (note.private) {
                  setPasswordPrompt({ noteId: note._id, title: note.title });
                } else {
                  setSelectedNote(note);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <h3 className="note-title">
                {note.title} {note.private && "🔒"}
              </h3>
              {!note.private && (
                <p className="note-content">
                  {note.content.length > 100
                    ? note.content.substring(0, 100) + "..."
                    : note.content}
                </p>
              )}
              <div
                className="note-actions"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="button-style edit-button"
                  onClick={() => handleEditClick(note)}
                >
                  Edit
                </button>
                <button
                  className="button-style delete-button"
                  onClick={() => handleDelete(note._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [page, setPage] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);

  const handleLogin = async () => {
    try {
      // 7. Updated Fetch Call
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.status === 404) {
        setAlertMessage("User not found! Redirecting to Signup...");
        setPage("signup");
      } else if (response.status === 401) {
        setAlertMessage("Wrong password, try again!");
      } else if (response.ok) {
        const data = await response.json();
        setAlertMessage(data.message);
        setPage("app");
      } else setAlertMessage("Unknown login error.");
    } catch {
      setAlertMessage("Failed to connect to the server.");
    }
  };

  const handleSignup = async () => {
    try {
      // 8. Updated Fetch Call
      const response = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.status === 400) {
        setAlertMessage("User already exists. Please login.");
        setPage("login");
      } else if (response.ok) {
        const data = await response.json();
        setAlertMessage(data.message);
        setPage("login");
      } else setAlertMessage("Unknown signup error.");
    } catch {
      setAlertMessage("Failed to connect to the server.");
    }
  };

  return (
    <>
      {page === "login" && (
        <LoginPage
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handleLogin={handleLogin}
          setPage={setPage}
        />
      )}
      {page === "signup" && (
        <SignupPage
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handleSignup={handleSignup}
          setPage={setPage}
        />
      )}
      {page === "app" && <NotesApp email={email} setPage={setPage} />}
      {alertMessage && (
        <CustomAlert message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}
    </>
  );
}