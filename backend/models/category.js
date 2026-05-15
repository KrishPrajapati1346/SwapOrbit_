const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const categorySchema = new mongoose.Schema({
    type: {
        type: String,
        // enum: ['cars', 'property', 'electronics', 'fashion' , 'pet' , 'others '],
        trim: true,
        required: true,
    },
    status: {
        type: Number,
        enum: [0, 1, 2], 
        default: 1, 
        required: true,
    },
    index: {
        type: Number,
        enum: [1, 2, 3, 4], 
        default: null, 
    },
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
    },
}, {
    timestamps: true
});


categorySchema.plugin(AutoIncrement, { inc_field: 'categoryID' });

module.exports = mongoose.model("Category" , categorySchema);
