const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc Get all users
// @Route api/v1/auth/users
// @access Private/admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc Get single user
// @Route  GET api/v1/auth/users/:id
// @access Private/admin

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with an id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: user });
});

// @desc Create User
// @Route POST api/v1/auth/users
// @access Private/admin

exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({ success: true, data: user });
});

// @desc Update a user
// @Route PUT api/v1/auth/users/:id
// @access Private/admin

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});

// @desc Delete a user
// @Route DELETE api/v1/auth/users/:id
// @access Priavte/admin

exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, data: {} });
});
