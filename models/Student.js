const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required.'],
      trim: true,
      minlength: [2, 'Full name must contain at least 2 characters.'],
      maxlength: [80, 'Full name cannot exceed 80 characters.']
    },
    prn: {
      type: String,
      required: [true, 'PRN is required.'],
      trim: true,
      uppercase: true,
      unique: true,
      minlength: [3, 'PRN must contain at least 3 characters.'],
      maxlength: [30, 'PRN cannot exceed 30 characters.']
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.']
    },
    department: {
      type: String,
      required: [true, 'Department is required.'],
      enum: {
        values: ['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Other'],
        message: 'Select a valid department.'
      }
    },
    year: {
      type: Number,
      required: [true, 'Year is required.'],
      enum: { values: [1, 2, 3, 4], message: 'Year must be between 1 and 4.' }
    },
    cgpa: {
      type: Number,
      required: [true, 'CGPA is required.'],
      min: [0, 'CGPA cannot be less than 0.'],
      max: [10, 'CGPA cannot exceed 10.']
    }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Student', studentSchema);
