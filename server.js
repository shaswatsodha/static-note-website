  import express from "express";
  import mongoose from "mongoose";
  import cors from "cors";
  import bcrypt from "bcryptjs";
  const app = express();
  app.use(cors());
  app.use(express.json());
  mongoose
    .connect("mongodb://127.0.0.1:27017/notesapp", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
  const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  });
  const User = mongoose.model("User", userSchema);
  const noteSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String },
    private: { type: Boolean, default: false },
    notePassword: { type: String },
    createdAt: { type: Date, default: Date.now },
  });
  const Note = mongoose.model("Note", noteSchema);
  app.post("/signup", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ message: "Email and password required" });
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: "User already exists" });
      const hashed = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashed });
      await user.save();
      res.json({ message: "Signup successful" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });
  app.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ message: "Invalid password" });
      res.json({ message: "Login successful", user: { email: user.email } });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });
  app.post("/addnote", async (req, res) => {
    try {
      const { userEmail, title, content, private: isPrivate, notePassword } = req.body;
      let hashedNotePassword = null;
      if (isPrivate && notePassword) {
        hashedNotePassword = await bcrypt.hash(notePassword, 10);
      }
      const note = new Note({
        userEmail,
        title,
        content,
        private: isPrivate,
        notePassword: hashedNotePassword,
      });
      await note.save();
      res.json({ message: "Note added successfully", note });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });
  app.get("/getnotes/:email", async (req, res) => {
    try {
      const notes = await Note.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
      res.json(notes);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });
  app.put("/updatenote/:id", async (req, res) => {
    try {
      const { title, content, private: isPrivate, notePassword } = req.body;
      let updateFields = { title, content, private: isPrivate };
      if (isPrivate && notePassword) {
        updateFields.notePassword = await bcrypt.hash(notePassword, 10);
      }
      const note = await Note.findByIdAndUpdate(req.params.id, updateFields, { new: true });
      res.json(note);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });
  app.delete("/deletenote/:id", async (req, res) => {
    try {
      await Note.findByIdAndDelete(req.params.id);
      res.json({ message: "Note deleted" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });
  app.post("/checknote/:id", async (req, res) => {
    try {
      const { password } = req.body;
      const note = await Note.findById(req.params.id);
      if (!note) return res.status(404).json({ message: "Note not found" });
      if (!note.private) return res.json({ content: note.content });
      const match = await bcrypt.compare(password, note.notePassword);
      if (!match) return res.status(401).json({ message: "Incorrect password" });
      res.json({ content: note.content });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });
  app.listen(5000, () => console.log("Server running on http://localhost:5000"));