const mongoose = require('mongoose');
const geoCoder = require('../utils/geocoder');

const StoreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter the name of store'],
      maxlength: [100, 'Name should be within 100 characters long'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//To add location using geo coder
StoreSchema.pre('save', async function (next) {
  const loc = await geoCoder.geocode(this.address);

  const coordinateValues = [loc[0].longitude, loc[0].latitude];
  this.location = {
    type: 'Point',
    coordinates: coordinateValues,
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };
  
  this.address = undefined;
  next();
});

StoreSchema.virtual('books', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'store',
  justOne: false,
});

module.exports = mongoose.model('Store', StoreSchema);
