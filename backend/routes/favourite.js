const express = require('express');
const router = express.Router();
const Favourite = require('../models/favourite'); // Update the path as needed
// const Product = require('../models/Product'); // Path to your Product model
// const User = require('../models/User');
const Product = require("../models/product");
const User = require("../models/user");
const { isLoggedIn, saveRedirectUrl, isOwner } = require("../middleware.js");

// Add to favourites

router.post('/addToFavourites',isLoggedIn, async (req, res) => {
    const { productID } = req.body;
    const userID = req.user?._id;

    if (!productID || !userID) {
        return res.status(400).json({ error: 'Product ID and User ID are required.' });
    }

    try {
        // Check if a favorite entry already exists for this user and product
        let favourite = await Favourite.findOne({ productID, userID });

        if (favourite) {
            // Toggle the isFavourite value
            favourite.isFavourite = !favourite.isFavourite;
            await favourite.save();
        } else {
            // Create a new favorite entry
            favourite = new Favourite({
                productID,
                userID,
                isFavourite: true,
            });
            await favourite.save();
        }

        res.redirect('back');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error occurred.' });
    }
});

router.get('/favourites',isLoggedIn, async (req, res) => {
    try {
        const userID = req.user?._id;

        if (!userID) {
            return res.status(401).send("Unauthorized. Please log in.");
        }

        const user = req.user;

        // Fetch all favorite entries for this user where isFavourite is true
        const favourites = await Favourite.find({
            userID,
            isFavourite: true,
        }).populate({
            path: 'productID',
            populate: [
                { path: 'categoryID', select: 'name' },
                { path: 'locationID', select: 'name' },
            ],
        });
        
// Log any missing productID for debugging
favourites.forEach(fav => {
    if (!fav.productID) {
        console.warn(`Missing productID in Favourite entry: ${fav._id}`);
    }
});
        // Map and simplify the data for rendering
        const favoriteProducts = favourites 
        .filter(fav => fav.productID !== null) 
        .map((fav) => ({
            id: fav.productID._id,
            title: fav.productID.title,
            description: fav.productID.description,
            price: fav.productID.price,
            images: fav.productID.images,
            isFavourite: fav.isFavourite,
        }));

        // Render the favorites page with the products
        res.render('listings/showFavourite.ejs', { products: favoriteProducts, user });
    } catch (error) {
        console.error("Error fetching favorite products:", error);
        res.status(500).send("Internal Server Error");
    }
});





module.exports = router;





