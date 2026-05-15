const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);


const carBikeSchema = new mongoose.Schema({

    brandName: {
        type:String,
        required:true,
    },
    modelName: {
        type:String,
        required:true,
    },
    variantName: {
        type:String,
        required:true,
    },
    year:{
        type:Number,
        min:1800,
        max:2025,
        required:true,

    },
    fuel:{
        type:String,
        enum: ['petrol', 'diesel', 'cng & hybrids', 'electric' , 'lpg' ],
        trim: true,
        required: true,
    },
    transmission:{
        type:String,
        enum: ['automatic', 'manual' ],
        trim: true,
        required: true,
    },
    noOfOwners:{
        type:Number,
        min:1,
        max:15,
        required:true,
    },
    kmDrived:{
        type:Number,
        min:0,
        required:true,
    },
    age:{
        type:Number,
        min:0,
        required:true,
    },
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
    },
    
}, {
    timestamps: true
});
	
carBikeSchema.plugin(AutoIncrement, { inc_field: 'carBikeID' });

module.exports = mongoose.model("CarBike" , carBikeSchema);

					
