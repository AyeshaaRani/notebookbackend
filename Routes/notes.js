const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Notes');
const { body, validationResult } = require('express-validator');

//Route:1 : Get all notes "/api/auth/ftechallnotes" login required
router.post('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Intternal server error")
    }
})
//Route:2 : add a  notes "/api/auth/addnote" login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'at least 5 char').isLength({ min: 5 }),

], async (req, res) => {
    try {
        const { title, description, tag } = req.body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNotes = await note.save()
        res.json(savedNotes)
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Intternal server error")
    }
})

//Route 3: update an existing note
router.put('/updatenotes/:id', fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  // create a newNote module object
  const newNote = {};
  if (title) newNote.title = title;
  if (description) newNote.description = description;
  if (tag) newNote.tag = tag;

  try {
      // find a note to be updated
      let note = await Note.findById(req.params.id); // Use 'params' instead of 'param'
      if (!note) return res.status(404).send("not found");

      if (note.user.toString() !== req.user.id) {
          return res.status(404).send("not allowed");
      }
      note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
      res.json({ note });
  } catch (error) {
      console.error(error.message);
      res.status(500).send("some error occurred");
  }
});

//Route 4: delete an existing note
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
  try {
      // find a note to be deleted
      let note = await Note.findById(req.params.id); // Use 'params' instead of 'param'
      if (!note) return res.status(404).send("not found");

      // allow deletion if user owns this note
      if (note.user.toString() !== req.user.id) {
          return res.status(404).send("not allowed");
      }
      await Note.findByIdAndDelete(req.params.id); // Remove unnecessary parameters
      res.json({ "success": "note has been deleted" });
  } catch (error) {
      console.error(error.message);
      res.status(500).send("some error occurred");
  }
});

module.exports = router;