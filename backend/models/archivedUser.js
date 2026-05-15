const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const archivedUserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            // unique: true,
            trim: true,
            lowercase: true,
        },
        phone: {
           type: String,
           default: "0000000000",
           trim: true,
        },
        role: {
            type: String,
            enum: ['buyer', 'seller', 'admin'],
            default: 'buyer', // Default role
            required: true,
        },
        photo: {
            url: {
                type: String,
                default: 'F:/SwapOrbit/public/images/default.png', 
            },
            filename: {
                type: String,
                default: 'user.jpg', 
            },
        },
        locationID: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
        }],
        productID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', 
        },
        archivedAt: {
            type: Date,
            default: Date.now, // Store when the account was archived
        },
        reason: {
            type: String,
            max:100,
            required: true
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

module.exports = mongoose.model('ArchivedUser', archivedUserSchema);
