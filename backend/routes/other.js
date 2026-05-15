const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const wrapAsync = require("../utils/wrapAsync.js");
const Other = require("../models/other");

module.exports = async function createOtherData(type,productID) {

    const newOther = new Other({
        type: type,
        productID: productID

    });

    await newOther.save();
    return newOther; 
};
