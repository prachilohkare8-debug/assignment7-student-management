const express = require('express');
const mongoose = require('mongoose');
const Student = require('../models/Student');

const router = express.Router();

function sendError(res, error) {
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(error.errors).map((item) => item.message).join(' ') });
  }
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    return res.status(409).json({ message: `A student with this ${field} already exists.` });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid student ID or field value.' });
  }
  console.error(error);
  return res.status(500).json({ message: 'Server error. Check the server terminal for details.' });
}

// READ: list students with optional filtering, sorting and pagination.
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const filter = {};

    if (req.query.department && req.query.department !== 'all') {
      filter.department = req.query.department;
    }
    if (req.query.year && req.query.year !== 'all') {
      const year = Number(req.query.year);
      if (![1, 2, 3, 4].includes(year)) return res.status(400).json({ message: 'Year filter must be between 1 and 4.' });
      filter.year = year;
    }
    if (req.query.q && req.query.q.trim()) {
      const q = req.query.q.trim().slice(0, 80);
      const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { fullName: { $regex: safeQ, $options: 'i' } },
        { prn: { $regex: safeQ, $options: 'i' } },
        { email: { $regex: safeQ, $options: 'i' } }
      ];
    }

    const allowedSorts = ['fullName', 'prn', 'email', 'department', 'year', 'cgpa', 'createdAt'];
    const sortBy = allowedSorts.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;
    const [students, total] = await Promise.all([
      Student.find(filter).sort({ [sortBy]: order, _id: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Student.countDocuments(filter)
    ]);
    res.json({ students, total, page, limit, pages: Math.max(Math.ceil(total / limit), 1), sortBy, order: order === 1 ? 'asc' : 'desc' });
  } catch (error) { sendError(res, error); }
});

// READ: fetch one student.
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid student ID.' });
    const student = await Student.findById(req.params.id).lean();
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json(student);
  } catch (error) { sendError(res, error); }
});

// CREATE: add a student.
router.post('/', async (req, res) => {
  try {
    const student = await Student.create({
      fullName: req.body.fullName,
      prn: req.body.prn,
      email: req.body.email,
      department: req.body.department,
      year: Number(req.body.year),
      cgpa: Number(req.body.cgpa)
    });
    res.status(201).json({ message: 'Student added successfully.', student });
  } catch (error) { sendError(res, error); }
});

// UPDATE: update selected student fields.
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid student ID.' });
    const updates = {};
    for (const field of ['fullName', 'prn', 'email', 'department', 'year', 'cgpa']) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) updates[field] = req.body[field];
    }
    if (updates.year !== undefined) updates.year = Number(updates.year);
    if (updates.cgpa !== undefined) updates.cgpa = Number(updates.cgpa);
    const student = await Student.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json({ message: 'Student updated successfully.', student });
  } catch (error) { sendError(res, error); }
});

// DELETE: remove selected student.
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid student ID.' });
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json({ message: 'Student deleted successfully.' });
  } catch (error) { sendError(res, error); }
});

module.exports = router;
