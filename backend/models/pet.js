const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);


const petSchema = new mongoose.Schema({

    type: {
        type: String,
        required: true,
        enum: ['dogs', 'cats', 'fishes & aquarium','birds','others'], 
    },
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
    },
}, {
    timestamps: true
});
	
petSchema.plugin(AutoIncrement, { inc_field: 'petID' });

module.exports = mongoose.model("Pet" , petSchema);

					
