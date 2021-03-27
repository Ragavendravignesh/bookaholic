const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const path = require('path');
const fileupload = require('express-fileupload');
const mongoSantize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

dotenv.config({ path: './config/config.env' });

//To import routes
const auth = require('./routes/auth');
const users = require('./routes/users');
const books = require('./routes/books');
const reviews = require('./routes/reviews');
const stores = require('./routes/stores');

connectDB();

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(xss());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

app.use(limiter);

app.use(hpp());
app.use(cors());
app.use(fileupload());
app.use(mongoSantize());
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//To mount routes
app.use('/api/v1/auth', auth);
app.use('/api/v1/auth/users', users);
app.use('/api/v1/books', books);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/stores', stores);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `server is running in ${process.env.NODE_ENV} mode at port ${PORT}`
  )
);

process.on('unhandledRejection', (err, promise) => {
  console.log(`Err: ${err.message}`);

  server.close(() => process.exit(1));
});
