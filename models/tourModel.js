const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxLength: [40, 'A tour name must have less or qual to 40 characters'],
        minLength: [10, 'A tour name must have more or qual to 10 characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either easy, medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val*10)/10//function, defines a custom setter for this property using Object.defineProperty().
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                return val < this.price;
            },
            message: 'Discount price {{VALUE}} should be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },

        coordinates: [Number],
        address: String,
        description: String,
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],

    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}, 
//If you want the virtual field to be displayed on client side, then set {virtuals: true} for toObject and toJSON in schema options as below:
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//Compound indexes are defined on the Schema itself. User.index({ first: 1, last: -1 }, { unique: true })
//Defines an index (most likely compound) for this schema.
tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});

//MongoDB's $near query operator and $geoNear aggregation stage require a 2dsphere index.
tourSchema.index({startLocation: '2dsphere'}); // Create a special 2dsphere index on `Tour.startLocation`

//A virtual property getter lets you define a property that won't get persisted to MongoDB.
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration/7;
});

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

//DOCUMENT MIDDLEWARE
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: {$ne: true}});
    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });

    next();
});

tourSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    //console.log(docs);
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
