const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Book = require('../models/Book');
const path = require('path');

// @desc get all books
// @route GET api/v1/books
// @access Public
exports.getBooks = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc get Single book
// @route GET api/v1/books/:id
// @access Public
exports.getBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!Book) {
    return next(
      new ErrorResponse(
        `Cannot fetch a book with an id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({ success: true, data: book });
});

// @desc Add a new book
// @route POST api/v1/books/:storeid
// @access Private
exports.createBook = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  req.body.store =req.params.storeid;
  
  const book = await Book.create(req.body);

  res.status(201).json({ success: true, data: book });
});

// @desc Update book details
// @route PUT api/v1/books/:id
// @access Private
exports.updateBook = asyncHandler(async (req, res, next) => {
  let book = await Book.findById(req.params.id);

  if (!book) {
    return next(
      new ErrorResponse(
        `Cannot fetch a book with this id ${req.params.id}`,
        404
      )
    );
  }

  if (book.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        'Sorry you did not add this book, hence cannot update its details',
        401
      )
    );
  }

  book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: book });
});

// @desc Delete book
// @route DELETE api/v1/books
// @access Private
exports.deleteBook = asyncHandler(async (req, res, next) => {
  let book = await Book.findById(req.params.id);

  if (!book) {
    return next(
      new ErrorResponse(
        `Cannot fetch a book with this id ${req.params.id}`,
        404
      )
    );
  }

  if (book.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        'Sorry you did not add this book, hence cannot update its details',
        401
      )
    );
  }

  await book.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc To upload photo
// @route api/v1/books/:id/photo
// @access public
exports.bookCoverUpload = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(
      new ErrorResponse(
        `Not able to fetch a book with an id of ${req.params.id}`,
        404
      )
    );
  }

  if (book.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Sorry your store did not have this book`, 401)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;

  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image', 400));
  }

  if (file.size > process.env.MAXIMUM_FILE_SIZE) {
    return next(
      new ErrorResponse(
        `File size should not be greater than ${process.env.MAXIMUM_FILE_SIZE}`,
        400
      )
    );
  }

  file.name = `photo_${req.params.id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      return next(
        new ErrorResponse('Something went wrong with file upload', 500)
      );
    }

    await Book.findByIdAndUpdate(req.params.id, { bookCover: file.name });

    res.status(200).json({ success: true, data: file.name });
  });
});
