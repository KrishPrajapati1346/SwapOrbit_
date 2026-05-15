const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const wrapAsync = require("../utils/wrapAsync.js");
const Electronics = require("../models/electronics");

module.exports = async function createElectronicsData(brandName, modelName, year, warranty, age,productID) {
    const newElectronics = new Electronics({
        brandName, 
        modelName, 
        year: parseInt(year, 10),
        warranty, 
        age: parseInt(age, 10),
        productID: productID

    });

    await newElectronics.save();
    return newElectronics; 
};
