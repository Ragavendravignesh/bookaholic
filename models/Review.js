const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for review'],
    trim: true,
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, 'Please add text'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10'],
  },
  createdAt: {
    type: Date,
    default: Date().now,
  },
  book: {
    type: mongoose.Schema.ObjectId,
    ref: 'Book',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  }
});

ReviewSchema.statics.getAverageRating = async function (bookId) {
  const obj = await this.aggregate([
    {
      $match: { book: bookId },
    },
    {
      $group: { _id: '$book', averageRating: { $avg: '$rating' } },
    },
  ]);
  
  try {
    await this.model('Book').findByIdAndUpdate(bookId, {
      averageRating: obj[0].averageRating,
    });
  } catch (err) {
    console.error(err);
  }
};

ReviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.book);
});

ReviewSchema.post('remove', async function () {
  await this.constructor.getAverageRating(this.book);
});

module.exports = mongoose.model('Review', ReviewSchema);
