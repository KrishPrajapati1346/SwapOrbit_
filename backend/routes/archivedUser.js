const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const ArchivedUser = require("../models/archivedUser.js");
const { isLoggedIn, saveRedirectUrl, isOwner } = require("../middleware.js");

// Models
const Category = require("../models/category");
const Product = require("../models/product");
const Fashion = require("../models/fashion");
const Location = require("../models/location");
const Pet = require("../models/pet");
const CarBike = require("../models/carBike");
const Property = require("../models/property");
const Other = require("../models/other");
const Electronics = require("../models/electronics");
const Favourite = require('../models/favourite');
const Comparison = require('../models/comparison');

// router.post('/archiveUser/:userId',isLoggedIn, wrapAsync(async (req, res) => {
        
//          try{
//                 const userId = req.params.userId;
//                 const reason = req.body.reason;
                
//                 const user = await User.findById(userId);
//                 if (!user) {
//                 return res.status(404).json({ message: 'User not found' });
//                 }

//                 // Create a new archived user
//                 const archivedUser = new ArchivedUser({
//                 username: user.username,
//                 email: user.email,
//                 phone: user.phone,
//                 role: user.role,
//                 photo: user.photo,
//                 locationID: user.locationID,
//                 productID: user.productID,
//                 archivedAt: new Date(), // Record when the user was archived
//                 reason: reason.trim() || 'No reason provided', // Save the reason
//                 });

//                 // Save the archived user
//                 await archivedUser.save();

//                 // Delete the user from the original collection
//                 await User.findByIdAndDelete(userId);
                
//                 req.flash('success', 'Your account has been deleted successfully');
//                 res.redirect('/product');

//         } catch (err) {
//                 console.error('Error archiving user:', err);
//                 res.status(500).json({ message: 'Failed to archive user' });
//         }
                

// }));

router.post('/archiveUser/:userId', isLoggedIn, wrapAsync(async (req, res) => {
        try {
            const userId = req.params.userId;
            const reason = req.body.reason;
    
            // Find the user by ID
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            // Archive the user
            const archivedUser = new ArchivedUser({
                username: user.username,
                email: user.email,
                phone: user.phone,
                role: user.role,
                photo: user.photo,
                locationID: user.locationID,
                archivedAt: new Date(),
                reason: reason.trim() || 'No reason provided',
            });
            await archivedUser.save();
    
            // Find all products associated with the user
            const userProducts = await Product.find({ userID: userId });
    
            for (const product of userProducts) {
                const productID = product._id;
    
                // Find the category associated with the product
                const categoryID = product.categoryID; // Assuming `categoryID` is in the product schema
                const category = await Category.findById(categoryID);
    
                if (category) {
                    // Remove product reference from the category
                    if (Array.isArray(category.productID)) {
                        category.productID = category.productID.filter(id => id.toString() !== productID.toString());
                    } else {
                        category.productID = null;
                    }
                    await category.save();
                }
    
                // Delete the product itself
                await Product.findByIdAndDelete(productID);
            }
    
            // Delete the user from the original collection
            await User.findByIdAndDelete(userId);
    
            req.flash('success', 'Your account and all associated products have been deleted successfully');
            res.redirect('/product');
        } catch (err) {
            console.error('Error archiving user and deleting products:', err);
            res.status(500).json({ message: 'Failed to archive user and delete products' });
        }
    }));
    

module.exports = router;

