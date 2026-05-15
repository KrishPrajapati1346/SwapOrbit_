const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);


const otherSchema = new mongoose.Schema({

    type: {
        type: String,
        required: true,
        enum: ['books', 'musical equipments', 'sports equipments','gym & fitness', 'others'], 
    },
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
    },
}, {
    timestamps: true
});
	
otherSchema.plugin(AutoIncrement, { inc_field: 'otherID' });

module.exports = mongoose.model("Other" , otherSchema);

					
