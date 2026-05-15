const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const wrapAsync = require("../utils/wrapAsync.js");
const Category = require("../models/category");
const Product = require("../models/product");
const Favourite = require('../models/favourite');


// Route for displaying products and categories
router.get("/", wrapAsync(async (req, res) => {
    try {
        // Fetch all categories and include product count for each
        const categories = await Category.find().lean(); // Fetch categories as plain JavaScript objects

        // Add product count to each category
        for (let category of categories) {
                const count = await Product.countDocuments({ categoryID: category._id }); // Count products for this category
                category.productCount = count; // Add the count as a new property
        }

        // Fetch first 5 products
        const products = await Product.find()
            .populate('categoryID', 'type')
            .populate('locationID', 'country state city')
            .populate('userID')
            .limit(7)
            .sort({ createdAt: -1 })
            .exec();

        // Check for favorites if user is logged in
        let updatedProducts = products;
        if (req.isAuthenticated()) {
            const userID = req.user._id;

            // Add `isFavourite` property to each product
            updatedProducts = await Promise.all(
                products.map(async product => {
                    const favourite = await Favourite.findOne({
                        productID: product._id,
                        userID,
                        isFavourite: true
                    });
                    return {
                        ...product.toObject(),
                        isFavourite: !!favourite // Convert truthy value to boolean
                    };
                })
            );
        }

        // Render the view with products and categories including product counts
        res.render('listings/showCategory.ejs', {
            products: updatedProducts,
            categories // Include categories with counts
        });

    } catch (error) {
        console.error('Server Error:', error);
        req.flash('error', 'An error occurred while loading the page');
        res.status(500).render('error', { error });
    }
}));



// // show Category Page
// router.get("/", wrapAsync(async (req, res) => {

//     const categorys = await Category.find();
//     res.render("listings/showCategory.ejs", { categorys });

// }));




// router.get('/search', async (req, res) => {
//     try {
//         const { query, category, subType, searchBy, min, max } = req.query;

//         // Fetch all categories and include product count
//         const categories = await Category.find().lean(); // Fetch categories as plain JavaScript objects

//         // Add product count to each category
//         for (let category of categories) {
//             const count = await Product.countDocuments({ categoryID: category._id }); // Count products for this category
//             category.productCount = count; // Add the count as a new property
//         }

//         // Handle text search
//         if (query) {
//             const products = await Product.find({
//                 title: { $regex: query, $options: 'i' },
//                 isSold: false
//             })
//                 .populate('locationID')
//                 .populate('categoryID')
//                 .populate('userID');

//             return res.render('listings/showCategory.ejs', { products, categories });
//         }

//         // Handle category-only search
//         if (category && !subType && !searchBy) {
//             const categoryDoc = await Category.findOne({ type: category });

//             if (!categoryDoc) {
//                 req.flash('error', `Category not found: ${category}`);
//                 return res.redirect('/product');
//             }

//             // Prepare search filter for price range
//             const searchFilter = { categoryID: categoryDoc._id, isSold: false };
//             if (min || max) {
//                 searchFilter.price = {};
//                 if (min) searchFilter.price.$gte = parseInt(min);
//                 if (max) searchFilter.price.$lte = parseInt(max);
//             }

//             // Find products matching the filter
//             const products = await Product.find(searchFilter)
//                 .populate('locationID')
//                 .populate('categoryID')
//                 .populate('userID');

//             if (products.length === 0) {
//                 req.flash('error', 'No products found in this category.');
//                 return res.redirect('/product');
//             }

//             return res.render('listings/showCategory.ejs', { products, categories });
//         }

//         // No criteria provided
//         req.flash('error', 'Please provide search criteria.');
//         return res.redirect('/category');

//     } catch (error) {
//         console.error('Search error:', error);
//         req.flash('error', 'An error occurred while searching.');
//         return res.redirect('/category');
//     }
// });
router.get('/search', async (req, res) => {
    try {
      const { query, category, subType, searchBy, min, max } = req.query;
      
      // Add debug logs
      console.log('Search params:', { query, category, subType, searchBy });
      console.log('Price range:', { min, max });
      
      // Fetch all categories and include product count
      const categories = await Category.find().lean();
      
      // Add product count to each category
      for (let category of categories) {
        const count = await Product.countDocuments({ categoryID: category._id });
        category.productCount = count;
      }
      
      // Handle text search
      if (query) {
        const products = await Product.find({ 
          title: { $regex: query, $options: 'i' }, 
          isSold: false 
        })
        .populate('locationID')
        .populate('categoryID')
        .populate('userID');
        
        return res.render('listings/showCategory.ejs', { 
          products, 
          categories,
          searchQuery: query,
          categoryName: category // Pass category name for the form
        });
      }
      
      // Handle category search (with or without price filtering)
      if (category) {
        const categoryDoc = await Category.findOne({ type: category });
        
        if (!categoryDoc) {
          req.flash('error', `Category not found: ${category}`);
          return res.redirect('/product');
        }
        
        // Prepare base search filter
        const searchFilter = { 
          categoryID: categoryDoc._id, 
          isSold: false 
        };
        
        // Add price range filtering if provided
        if (min || max) {
          searchFilter.price = {};
          
          // Properly parse values as numbers and add to filter
          if (min && !isNaN(parseFloat(min))) {
            searchFilter.price.$gte = parseFloat(min);
          }
          
          if (max && !isNaN(parseFloat(max))) {
            searchFilter.price.$lte = parseFloat(max);
          }
        }
        
        // Log the final search filter for debugging
        console.log('Final search filter:', JSON.stringify(searchFilter, null, 2));
        
        // Find products matching the filter
        const products = await Product.find(searchFilter)
          .populate('locationID')
          .populate('categoryID')
          .populate('userID');
        
        // Always render the page, regardless of product count
        return res.render('listings/showCategory.ejs', { 
          products, 
          categories,
          priceMin: min,
          priceMax: max,
          categoryName: category // Make sure to pass the category name
        });
      }
      
      // No criteria provided
      req.flash('error', 'Please provide search criteria.');
      return res.redirect('/category');
      
    } catch (error) {
      console.error('Search error:', error);
      req.flash('error', 'An error occurred while searching.');
      return res.redirect('/category');
    }
  });













// Render Add Category Form
router.get("/newCategory", wrapAsync(async (req, res) => {
    res.render("listings/newCategory.ejs");
}));

// New Category creation route
router.post("/", wrapAsync(async (req, res) => {
    const { type } = req.body;

    // Check if category with the same type already exists
    const existingCategory = await Category.findOne({ type: type });

    if (existingCategory) {
        return res.status(400).send("Category with this type already exists.");
    }
    const newCategory = new Category({
        type: type
    });

    await newCategory.save();
    res.redirect("/category");
}));

// Update Route
router.put("/:categoryID", wrapAsync(async (req, res) => {

    const { categoryID } = req.params;
    const { type } = req.body;
    const existingCategory = await Category.findOne({ type: type });

    if (existingCategory) {
        return res.status(400).send("Category with this type already exists.");
    }

    const updatedCategory = await Category.findOneAndUpdate(
        { categoryID: parseInt(categoryID) }, // Query by categoryID
        { type: type }, 
        { new: true, runValidators: true } // Options
    );
    res.redirect("/category");

}));


// Delete Category
router.delete("/:categoryID/delete", wrapAsync(async (req, res) => {

    const { categoryID } = req.params;
    const categoryToDelete = await Category.findOneAndDelete({ categoryID: categoryID });
    res.redirect("/category");

}));


module.exports = router;
