const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const wrapAsync = require("../utils/wrapAsync.js");
const CarBike = require("../models/carBike");

module.exports = async function createCarBikeData( brandName, modelName, variantName, year, fuel, transmission, noOfOwners, kmDrived, age,productID) {
    try {
        const newCarBike = new CarBike({
            brandName,
            modelName,
            variantName,
            year,
            fuel,
            transmission,
            noOfOwners,
            kmDrived,
            age,
            productID: productID

        });

        // Save the document to the database
        const savedCarBike = await newCarBike.save();

        // You can return the saved car/bike data or just the id
        return savedCarBike._id;  // You can return the whole document if needed
    } catch (error) {
        console.error('Error creating CarBike:', error);
        throw error; // Handle the error accordingly
    }
};
