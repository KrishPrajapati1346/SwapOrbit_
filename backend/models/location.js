const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const locationSchema = new mongoose.Schema(
    {
        country: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
          
            trim: true,
        },
        city: {
            type: String,
           
            trim: true,
        },
        area: {
            type: String,
           
            trim: true,
        },
        zipCode: {
            type: Number,
          
            trim: true,
            min:0
        },
        latitude: {
            type: Number,
            required: false,
        },
        longitude: {
            type: Number,
            required: false,
        },
        type: {
            type: String,
            required: true,
            enum: ['user', 'product'], 
        },
        productID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', 
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

// Apply auto-increment plugin for loc_id
locationSchema.plugin(AutoIncrement, { inc_field: 'locationID' });

// Export the model
module.exports = mongoose.model('Location', locationSchema);
