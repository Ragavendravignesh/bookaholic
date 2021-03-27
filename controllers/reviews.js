const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { findByIdAndUpdate } = require('../models/Review');
const Review = require('../models/Review');
const Book = require('../models/Book');

// @desc Get all reviews
// @Route GET api/v1/reviews
// @Route GET api/v1/books/:bookid/reviews
// @access Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bookid) {
    const reviews = await Review.find({ book: req.params.bookid });

    res
      .status(200)
      .json({ sucess: true, count: reviews.length, data: reviews });
  } else {
    res.status(200).json({ success: true, data: res.advancedResults });
  }
});

// @desc Get single review
// @route GET api/v1/reviews/:id
// @access public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse('Not able to find this review', 404));
  }

  res.status(200).json({ success: true, data: review });
});

// @desc Add review
// @route POST api/v1/books/:bookid/reviews
// @access public
exports.createReview = asyncHandler(async (req, res, next) => {
  req.body.book = req.params.bookid;
  req.body.user = req.user.id;
  
  const book = await Book.findById(req.params.bookid);

  if (!book) {
    return next(
      new ErrorResponse(
        `Cannot able to fetch a book with an id of ${req.params.bookid}`,
        400
      )
    );
  }

  const review = await Review.create(req.body);

  res.status(200).json({ success: true, data: review });
});

// @desc Update a review
// @route PUT api/v1/reviews/:id
// @access Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(
        `Sorry not able to find a review with id ${req.params.id}`,
        400
      )
    );
  }

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Sorry you cannot edit the review', 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: review });
});

// @desc Delete a review
// @route Delete api/v1/reviews
// @access public
exports.deleteReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(
        `Sorry not able to find a review with id ${req.params.id}`,
        400
      )
    );
  }

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Sorry you cannot edit the review', 401));
  }

  await review.remove();

  res.status(200).json({ success: true, data: {} });
});
