const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const propertySchema = new mongoose.Schema({

    type: {
        type: String,
        required: true,
        enum: ['apartment', 'villa', 'independent house', 'plot', 'commercial', 'other'], 
        trim: true
    },
    bhk: {
        type: Number,
        required: true,
       
    },
    bathrooms: {
        type: Number,
        required: true,
     
    },
    furnishing: {
        type: String,
        enum: ['furnished', 'semi-furnished', 'unfurnished'],
        required: true,
    },
    areaSqft: {
        type: Number,
        required: true,
        min: 0 
    },
    carpetAreaSqft: {
        type: Number,
        min: 0 
    },
    bachelorsAllowed: {
        type: Boolean,
        required: true 
    },
    totalFloors: {
        type: Number,
        required: true,
        min: 1
    },
    carParkingSpace: {
        type: Number,
        required: true,
       
    },
    facing: {
        type: String,
        enum: ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'], 
        required: true 

    },
    type2: {
        type: String,
        enum: ['rent', 'sell'], 
    },
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
    },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Apply auto-increment to prop_id
propertySchema.plugin(AutoIncrement, { inc_field: 'propertyID' });

module.exports = mongoose.model('Property', propertySchema);
