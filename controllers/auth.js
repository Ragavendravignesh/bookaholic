const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc Register a user
// @route POST api/v1/auth/register
// @access public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, role, password } = req.body;

  const user = await User.create({
    name,
    email,
    role,
    password,
  });

  sendTokenResponse(user, 200, res);
});

// @desc Login a user
// @route POST api/v1/auth/login
// @access Private
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please enter email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid Credentials', 401));
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc Logout a user
// @route GET api/v1/auth/logout
// @access public
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, data: {} });
});

// @desc Get an user
// @route GET api/v1/auth/me
// @access Public
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, data: user });
});

// @desc Forgot password
// @route POST api/v1/auth/forgotpassword
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorResponse('Entered email id is not registered with us', 400)
    );
  }

  const resetToken = user.getResetPasswordToken();

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receving this message, because you or someone requested for a password reset for this account. To reset your password pleas make a PUT request to this following URL: ${resetUrl}`;

  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      email: user.email,
      subject: 'Bookaholic password reset token',
      message,
    });

    res.status(200).json({ success: true, data: 'Email Sent' });
  } catch (err) {
    this.resetPasswordToken = undefined;
    this.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc reset Password
// @route PUT api/v1/auth/resetpassword/:resettoken
// @acess public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() }});
  if (!user) {
    return next(
      new ErrorResponse(
        'Something went wrong, token may expire or user not found',
        401
      )
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(user, 201, res);
});

// @desc Update details
// @route PUT api/v1/auth/updatedetails
// @access Public
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldToUpdate = { name: req.body.name, email: req.body.email };

  const user = await User.findByIdAndUpdate(req.user.id, fieldToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});

// @desc Update password
// @route PUT api/v1/auth/updatepassword
// @access Public
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new ErrorResponse('Not able to find the user', 404));
  }

  if (!(await user.matchPassword(req.body.currentPassword, user.password))) {
    return next(new ErrorResponse('Password did not match', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// To send the token response
const sendTokenResponse = (user, statusCode, res) => {
  let token = user.getSignedJsonWebToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token });
};
