import express from "express";
import authenticateToken from "../utilities.js";
import {
  createAccount,
  login,
  getUser,
  addNote,
  editNote,
  updateNotePinned,
  getAllNotes,
  deleteNote,
  searchNotes,
} from "../controllers/controller.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ data: "hello" });
});

router.post("/create-account", createAccount);
router.post("/login", login);
router.get("/get-user", authenticateToken, getUser);
router.post("/add-note", authenticateToken, addNote);
router.put("/edit-note/:noteId", authenticateToken, editNote);
router.put("/update-note-pinned/:noteId", authenticateToken, updateNotePinned);
router.get("/get-all-notes", authenticateToken, getAllNotes);
router.delete("/delete-note/:noteId", authenticateToken, deleteNote);
router.get("/search-notes", authenticateToken, searchNotes);

export default router;
