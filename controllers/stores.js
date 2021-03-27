const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Store = require('../models/Store');
const geocoder = require('../utils/geocoder');

// @desc Get all stores
// @GET api/v1/stores
// @acess public
exports.getStores = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc Get single store
// @GET api/v1/stores/:id
// @acess public
exports.getStore = asyncHandler(async (req, res, next) => {
  const store = await Store.findById(req.params.id).populate('books');

  if (!store) {
    return next(
      new ErrorResponse(
        `Sorry cannot able to fetch a store with an id ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({ success: true, data: store });
});

// @desc Create new store
// @POST api/v1/stores/
// @access priavte
exports.createStore = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  
  const store = await Store.create(req.body);

  if (!store) {
    return next(new ErrorResponse('Sorry cannot create a store', 401));
  }

  res.status(200).json({ success: true, data: store });
});

// @desc Update store record
// @PUT api/v1/stores/:id
// @access private
exports.updateStore = asyncHandler(async (req, res, next) => {
  let store = await Store.findById(req.params.id);

  if (!store) {
    return next(
      new ErrorResponse(
        `Cannot fetch a store with this id ${req.params.id}`,
        404
      )
    );
  }

  if (store.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse("Sorry you can't edit or modify store details", 401)
    );
  }

  store = await Store.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: store });
});

// @desc Delete a store
// @route api/v1/stores/:id
// @access Private
exports.deleteStore = asyncHandler(async (req, res, next) => {
  let store = await Store.findById(req.params.id);

  if (!store) {
    return next(
      new ErrorResponse(
        `Cannot fetch a store with this id ${req.params.id}`,
        404
      )
    );
  }

  if (store.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse("Sorry you can't edit or modify store details", 401)
    );
  }

  await store.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc Get books within radius
// @route GET api/v1/books/:bookid/stores/:zipcode/:distance
// @access public
exports.getStoresWithinRadius = asyncHandler(async (req, res, next) => {
  const stores = await Store.find({ book: req.params.bookid });

  if (!stores) {
    return next(
      new ErrorResponse(
        `Sorry book with id ${req.params.bookid} not found`,
        404
      )
    );
  }

  const { zipcode, distance } = req.params;

  const loc = await geocoder.geocode(zipcode);

  const lng = loc[0].longitude;
  const lat = loc[0].latitude;

  const radius = distance / 3958;

  const result = await Store.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });

  res.status(200).json({ success: true, count: result.length, data: result });
});
