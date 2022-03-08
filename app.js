const path = require('path');
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express(); //express() upon calling add a bunch of methods

// const corsOptions = {
//     origin: true,
//     credentials: true,
// };

app.use(cors());
app.use(cookieParser());
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

//Set Security HTTP Headers

app.use(helmet());

// limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!' 
});
app.use('/api',limiter); 

//express does not put the body data on the request, so to make that data available we use something called middleware
app.use(express.json({
    limit: '10kb'
})); //express.json is middleware and middleware is a function that can modify incoming request data

app.use(express.urlencoded({ extended: true, limit: '10kb'}));

//Data Sanitization against NOSQL query injection
app.use(mongoSanitize());

//Data Sanitization against XSS
app.use(xss());

//Prevent parameter pollution
app.use(hpp({
    whitelist: [
        'duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'
    ]
}));


// 1) MIDDLEWARES 

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));  //using 3rd party middleware
}

app.use(compression());

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log('REQ COOKIES: ', req.cookies);
    next();
})
// 2) ROUTE HANDLERS

//3) ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.use('/', viewRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} onthis server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
