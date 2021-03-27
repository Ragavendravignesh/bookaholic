const express = require('express');
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  bookCoverUpload,
} = require('../controllers/books');

const adavancedResults = require('../middleware/advancedResults');
const Book = require('../models/Book');

const storesRouter = require('./stores');
const reviewRouter = require('./reviews');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use('/:bookid/stores', storesRouter);
router.use('/:bookid/reviews', reviewRouter);


router.route('/').get(adavancedResults(Book, {path:'store', select:'name location'}), getBooks);

router
  .route('/:storeid')
  .post(protect, authorize('admin', 'storeowner'), createBook);

router
  .route('/:id')
  .get(getBook)
  .put(protect, authorize('storeowner', 'admin'), updateBook)
  .delete(protect, authorize('storeowner', 'admin'), deleteBook);

router
  .route('/:id/photo')
  .put(protect, authorize('storeowner', 'admin'), bookCoverUpload);

module.exports = router;
