const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Check if the model has already been defined
if (!mongoose.models.Electronics) {
    const electronicsSchema = new mongoose.Schema({
        brandName: {
            type: String,
            required: true,
        },
        modelName: {
            type: String,
            required: true,
        },
        year: {
            type: Number,
            min: 1970,
            max: 2025,
            required: true,
        },
        warranty: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            min: 0,
            required: true,
        },
        productID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', 
        },
    }, {
        timestamps: true,
    });

    // Apply the plugin
    electronicsSchema.plugin(AutoIncrement, { inc_field: 'electronicsID' });

    // Export the model
    mongoose.model('Electronics', electronicsSchema);
}

module.exports = mongoose.model('Electronics');
