const express = require('express');

const {
  getStores,
  getStore,
  createStore,
  updateStore,
  deleteStore,
  getStoresWithinRadius,
} = require('../controllers/stores');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const Store = require('../models/Store');

router
  .route('/')
  .get(advancedResults(Store, 'books'), getStores)
  .post(protect, authorize('admin', 'storeowner'), createStore);

router
  .route('/:id')
  .get(getStore)
  .put(protect, authorize('admin', 'storeowner'), updateStore)
  .delete(protect, authorize('admin', 'storeowner'), deleteStore);

router.route('/:zipcode/:distance').get(getStoresWithinRadius);

module.exports = router;
