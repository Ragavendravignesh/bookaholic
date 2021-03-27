const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than fifty characters.'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Descriptiom should be within 500 characters'],
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be greater than 1'],
    max: [10, 'Rating must be within 10'],
  },
  authorName: {
    type: String,
    required: [true, 'Please specify an author name'],
    maxlength: [100, 'Name should be within 100 characters length'],
  },
  price: {
    type: Number,
    required: [true, 'Please specify the cost of book'],
  },
  bookCover: {
    type: String,
    default: 'no-photo.jpg',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: true,
  },
});

module.exports = mongoose.model('Book', BookSchema);
