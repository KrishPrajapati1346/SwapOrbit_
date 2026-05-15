const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);


const fashionSchema = new mongoose.Schema({

    type: {
        type: String,
        required: true,
        enum: ['men', 'women', 'kids'], 
        trim: true
    },
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
    },
}, {
    timestamps: true
});
	
fashionSchema.plugin(AutoIncrement, { inc_field: 'fashionID' });

module.exports = mongoose.model("Fashion" , fashionSchema);

					
