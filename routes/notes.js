import express from 'express';
import striptags from 'striptags';  // For HTML input
import Note from '../models/Note.js';
const router = express.Router();

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.session.toast = { message: 'Please log in to access notes', type: 'warn' };
  res.redirect('/login');
}

// List notes
router.get('/', ensureAuth, async (req, res) => {
  let filter = {};
if (req.query.filter === 'favorites') filter.isFavorite = true;
if (req.query.filter === 'pinned') filter.isPinned = true;

const notes = await Note.find({ user: req.user.id, ...filter })
  .sort({ isPinned: -1, isFavorite: -1, updatedAt: -1 });

  // Add plain text field
  const safeNotes = notes.map(n => ({
    ...n.toObject(),
    contentText: striptags(n.content) // strip HTML
  }));

  res.render('notes/list', { title: 'Your Notes', notes: safeNotes });
});

//Create form note
router.get('/create', ensureAuth, (req, res) => {
  res.render('notes/create', { title: 'Create Note', note: {} });
});

//Create note
router.post('/', ensureAuth, async (req, res) => {
  try {
    await Note.create({ title: req.body.title || 'Untitled', content: req.body.content || '', user: req.user._id });
    req.session.toast = { message: 'Note created', type: 'success' };
    res.redirect('/notes');
  } catch (err) {
    console.error(err);
    req.session.toast = { message: 'Failed to create note', type: 'error' };
    res.redirect('/notes');
  }
});

//Edit form note
router.get('/:id/edit', ensureAuth, async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note || String(note.user) !== String(req.user._id)) {
    req.session.toast = { message: 'Note not found', type: 'error' };
    return res.redirect('/notes');
  }
  res.render('notes/edit', { title: 'Edit Note', note });
});


//Update note
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note || String(note.user) !== String(req.user._id)) {
      req.session.toast = { message: 'Note not found', type: 'error' };
      return res.redirect('/notes');
    }
    note.title = req.body.title || note.title;
    note.content = req.body.content || note.content;
    await note.save();
    req.session.toast = { message: 'Note updated', type: 'success' };
    res.redirect('/notes');
  } catch (err) {
    console.error(err);
    req.session.toast = { message: 'Update failed', type: 'error' };
    res.redirect('/notes');
  }
});


// Delete note
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!note) {
      req.session.toast = { message: 'Note not found or not authorized', type: 'error' };
      return res.redirect('/notes');
    }

    req.session.toast = { message: 'Note deleted', type: 'info' };
    res.redirect('/notes');
  } catch (err) {
    console.error('Delete error:', err);
    req.session.toast = { message: 'Delete failed', type: 'error' };
    res.redirect('/notes');
  }
});


// Toggle pin
router.post('/:id/toggle-pin', ensureAuth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.redirect('/notes');

    note.isPinned = !note.isPinned;
    await note.save();
    res.redirect('/notes');
  } catch (err) {
    console.error(err);
    res.redirect('/notes');
  }
});

// Toggle favorite
router.post('/:id/toggle-favorite', ensureAuth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.redirect('/notes');

    note.isFavorite = !note.isFavorite;
    await note.save();
    res.redirect('/notes');
  } catch (err) {
    console.error(err);
    res.redirect('/notes');
  }
});

export default router;
