import User from "../models/user.model.js";
import Note from "../models/note.model.js";
import jwt from "jsonwebtoken";
import authenticateToken from "../utilities.js";

export const createAccount = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: true, message: "All fields are required" });
  }

  try {
    const isUser = await User.findOne({ email: email });

    if (isUser) {
      return res.json({
        error: true,
        message: "User already exists",
      });
    }

    const user = new User({
      fullName,
      email,
      password,
    });

    await user.save();

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "36000m",
    });

    return res.json({
      error: false,
      user,
      accessToken,
      message: "Registration Successful",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: true, message: "Email and password are required" });
  }

  try {
    const userInfo = await User.findOne({ email: email });

    if (!userInfo || userInfo.password !== password) {
      return res.status(400).json({ error: true, message: "Invalid credentials" });
    }

    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "36000m",
    });

    return res.json({
      error: false,
      message: "Login Successful",
      email,
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const getUser = async (req, res) => {
  const { user } = req.user;

  try {
    const isUser = await User.findOne({ _id: user._id });

    if (!isUser) {
      return res.sendStatus(401);
    }

    return res.json({
      user: isUser,
      message: "",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const addNote = async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;

  if (!title || !content) {
    return res.status(400).json({ error: true, message: "Title and content are required" });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const editNote = async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;

  if (!title && !content && !tags) {
    return res.status(400).json({ error: true, message: "No changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const updateNotePinned = async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note pinned status updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const getAllNotes = async (req, res) => {
  const { user } = req.user;

  try {
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });

    return res.json({
      error: false,
      notes,
      message: "All notes retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }}

  export const deleteNote = async (req, res) => {
    const noteId = req.params.noteId;
    const { user } = req.user;
  
    try {
      const note = await Note.findOne({ _id: noteId, userId: user._id });
  
      if (!note) {
        return res.status(404).json({ error: true, message: "Note not found" });
      }
  
      await Note.deleteOne({ _id: noteId, userId: user._id });
  
      return res.json({
        error: false,
        message: "Note deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
      });
    }
  };
  
  export const searchNotes = async (req, res) => {
    const { user } = req.user;
    const { query } = req.query;
  
    if (!query) {
      return res
        .status(400)
        .json({ error: true, message: "Search query is required" });
    }
  
    try {
      const matchingNotes = await Note.find({
        userId: user._id,
        $or: [
          { title: { $regex: new RegExp(query, "i") } },
          { content: { $regex: new RegExp(query, "i") } },
        ],
      });
  
      return res.json({
        error: false,
        notes: matchingNotes,
        message: "Notes matching the search query retrieved successfully",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
      });
    }
  };
