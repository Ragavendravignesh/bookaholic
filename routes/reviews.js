const express = require('express');
const {
  getReview,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const Review = require('../models/Review');

router
  .route('/')
  .get(advancedResults(Review, 'books'), getReviews)
  .post(protect, authorize('admin', 'user'), createReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('admin', 'user'), updateReview)
  .delete(protect, authorize('admin', 'user'), deleteReview);

module.exports = router;
