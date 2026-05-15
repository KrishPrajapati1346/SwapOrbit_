const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const favouriteSchema = new mongoose.Schema({

    isFavourite:{
        type: Boolean,
        required: true ,
        default: false,
    },
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

favouriteSchema.plugin(AutoIncrement, { inc_field: 'favouriteID' });

module.exports = mongoose.model('Favourite', favouriteSchema);
