const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const wrapAsync = require("../utils/wrapAsync.js");
const Property = require("../models/property");
module.exports = async function createPropertyData(propertyData,productID) {
    // Convert string values to appropriate types
    const newProperty = new Property({
        type: propertyData.type,
        bhk: Number(propertyData.bhk),
        bathrooms: Number(propertyData.bathrooms),
        furnishing: propertyData.furnishing,
        areaSqft: Number(propertyData.areaSqft),
        carpetAreaSqft: propertyData.carpetAreaSqft ? Number(propertyData.carpetAreaSqft) : null,
        bachelorsAllowed: propertyData.bachelorsAllowed === 'true',
        totalFloors: Number(propertyData.totalFloors),
        carParkingSpace: Number(propertyData.carParkingSpace),
        facing: propertyData.facing,
        type2: propertyData.type2,
        productID: productID

    });

    // Add validation before saving
    try {
        await newProperty.validate();
        await newProperty.save();
        return newProperty;
    } catch (error) {
        console.error('Property validation error:', error);
        throw error;
    }
};