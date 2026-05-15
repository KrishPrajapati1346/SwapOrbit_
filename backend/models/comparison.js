const mongoose = require('mongoose');

const comparisonSchema = new mongoose.Schema({
    userID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
      
    },
    productID: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
        
    },

});

module.exports = mongoose.model('Comparison', comparisonSchema);
