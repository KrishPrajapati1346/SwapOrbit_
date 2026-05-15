const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const wrapAsync = require("../utils/wrapAsync.js");
const Pet = require("../models/pet");

module.exports = async function createPetData(type,productID) {

    const newPet = new Pet({
        type: type,
        productID: productID

    });

    await newPet.save();
    return newPet; 
};
