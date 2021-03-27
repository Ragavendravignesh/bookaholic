const fs = require('fs');
const mongoose = require('mongoose');
const { dirname } = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

//To import model
const Book = require('./models/Book');
const Review = require('./models/Review');
const Store = require('./models/Store');
const User = require('./models/User');

//To connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

//To import data
const books = JSON.parse(fs.readFileSync(`${__dirname}/_data/books.json`));
const stores = JSON.parse(fs.readFileSync(`${__dirname}/_data/stores.json`));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`));

//To import
const importData = async function () {
  try {
    await Book.create(books);
    await Review.create(reviews);
    await Store.create(stores);
    await User.create(users);
    
    console.log("Data inserted");
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

//To Delete
const deleteData = async function () {
  try {
    await Book.deleteMany();
    await Review.deleteMany();
    await Store.deleteMany();
    await User.deleteMany();

    console.log("Data destroyed");
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') importData();
else if (process.argv[2] === '-d') deleteData();
