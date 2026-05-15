const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);


const productSchema = new mongoose.Schema({

    title: {
        type:String,
        required:true,
    },
    description: {
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
        min:0,
    },
    images: [{  // array of images
        url: String,
        filename: String,
    }],
    isSold:{
        type: Boolean,
        default: false,
        
    },
    locationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location', 
    },
    categoryID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', 
    },
    favouriteID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Favorite', 
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
    },
}, {
    timestamps: true
});
	
productSchema.plugin(AutoIncrement, { inc_field: 'productID' });

module.exports = mongoose.model("Product" , productSchema);
