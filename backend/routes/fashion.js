const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const wrapAsync = require("../utils/wrapAsync.js");
const Fashion = require("../models/fashion");

module.exports = async function createFashionData(type,productID) {
   
  
    if (!type) {
        throw new Error('Fashion type is required');
    }
    if (!productID) {
        throw new Error('Product ID is required');
    }

    const newFashion = new Fashion({
        type: type,
        productID: productID
    });

    await newFashion.save();
    return newFashion; 
};

module.exports = async function updateFashionData(type, productID) {
    if (!type) {
        throw new Error('Fashion type is required');
    }
    if (!productID) {
        throw new Error('Product ID is required');
    }

    // Check if a Fashion document already exists for the given productID
    let fashionData = await Fashion.findOne({ productID });

    if (fashionData) {
        // Update the existing Fashion document
        fashionData.type = type;
        await fashionData.save();
    } else {
        // If no Fashion document exists, create a new one
        fashionData = new Fashion({
            type: type,
            productID: productID
        });
        await fashionData.save();
    }

    return fashionData;
};

// module.exports = router;
