const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const wrapAsync = require("../utils/wrapAsync.js");

// MiddleWares
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
const User = require("../models/user");
const Comparison = require('../models/comparison');


// Routes Files 
const createFashionData = require('./fashion');
const createElectronicsData = require('./electronics');
const createPetData = require('./pet');
const createOtherData = require('./other');
const createPropertyData = require('./property');
const createCarBikeData = require('./carBike');


// Handle Image Upload
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage }).array('images', 15); // Allow up to 15 images




// // Display Products
// router.get("/saumil", wrapAsync(async (req, res) => {
//    res.render("listings/homepage.ejs");
// }));

// // Display Products
// router.get("/", isLoggedIn, wrapAsync(async (req, res) => {
//     try {
//         // Fetch all products from the database
//         const products = await Product.find()
//             .populate('categoryID', 'type')  // Populating category details (only the 'type' field)
//             .populate('locationID', 'country state city')  // Populating location details
//             .populate('userID', 'fname lname')  // Populating user details
//             .exec();

//         if (!products || products.length === 0) {
//             return res.status(404).send('No products found.');
//         }

//         // You can either render a view and pass the products data or return it as a JSON response
//         // If you want to render a view:
//         res.render('listings/homepage.ejs', { products });

//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server error');
//     }
// }));

//example code
router.get("/demo", wrapAsync(async (req, res) => {
    res.render("listings/exampleshowproduct.ejs");
}));


// // Display Products
// router.get("/",isLoggedIn, wrapAsync(async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = 10;
//         const skip = (page - 1) * limit;

//         // Fetch paginated products
//         const products = await Product.find()
//             .populate('categoryID', 'type')
//             .populate('locationID', 'country state city')
//             .populate('userID')
//             .skip(skip)
//             .limit(limit)
//             .sort({ createdAt: -1 })
//             .exec();

//         // Get total count for checking if more products exist
//         const totalProducts = await Product.countDocuments();
//         const hasMore = totalProducts > skip + products.length;

//         const userID = req.user._id; // Assuming `req.user` contains logged-in user details

//         // Add `isFavourite` property to each product
//         const updatedProducts = await Promise.all(
//             products.map(async product => {
//                 const favourite = await Favourite.findOne({
//                     productID: product._id,
//                     userID,
//                     isFavourite: true
//                 });
//                 return {
//                     ...product.toObject(),
//                     isFavourite: !!favourite // Convert truthy value to boolean
//                 };
//             })
//         );

//         if (req.xhr) {
//             // If AJAX request, return JSON
//             return res.json({
//                 products: updatedProducts,
//                 hasMore,
//                 currentPage: page
//             });
//         }

//         res.render('listings/homepage.ejs', {
//             products: updatedProducts,
//             hasMore,
//             currentPage: page
//         });

//     } catch (error) {
//         console.error('Server Error:', error);
//         if (req.xhr) {
//             return res.status(500).json({ error: 'Server error' });
//         }
//         res.status(500).send('Server error');
//     }
// }));

// Display Products
router.get("/", wrapAsync(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        // Fetch paginated products
        const products = await Product.find()
            .populate('categoryID', 'type')
            .populate('locationID', 'country state city')
            .populate('userID')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();

        // Get total count for checking if more products exist
        const totalProducts = await Product.countDocuments();
        const hasMore = totalProducts > skip + products.length;

        const userID = req.user?._id; // Safely access `req.user._id`

        // Add `isFavourite` property to each product
        const updatedProducts = await Promise.all(
            products.map(async product => {
                if (userID) {
                    // User is logged in, check if product is a favourite
                    const favourite = await Favourite.findOne({
                        productID: product._id,
                        userID,
                        isFavourite: true
                    });
                    return {
                        ...product.toObject(),
                        isFavourite: !!favourite // Convert truthy value to boolean
                    };
                } else {
                    // User not logged in, set `isFavourite` to false
                    return {
                        ...product.toObject(),
                        isFavourite: false
                    };
                }
            })
        );

        if (req.xhr) {
            // If AJAX request, return JSON
            return res.json({
                products: updatedProducts,
                hasMore,
                currentPage: page
            });
        }

        res.render('listings/homepage.ejs', {
            products: updatedProducts,
            hasMore,
            currentPage: page
        });

    } catch (error) {
        console.error('Server Error:', error);
        if (req.xhr) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.status(500).send('Server error');
    }
}));



// Render Add Product Form
router.get("/newProduct", isLoggedIn, wrapAsync(async (req, res) => {
    try {
        const categorys = await Category.find();

        // Fetch the user's specific location based on locationID
        const user = await User.findById(req.user._id).populate('locationID');

        // Ensure the user and their locationID exist
        if (!user || !user.locationID) {
            return res.status(404).send('No associated location found.');
        }

        // Filter the locations to only show the user's specific location
        const locations = await Location.find({ _id: { $in: user.locationID } });

        // Render the form with filtered locations
        res.render('listings/newProduct.ejs', { categorys, locations, user });
    } catch (error) {
        console.error('Error rendering product form:', error);
        res.status(500).send('Server error.');
    }
}));


// Add new product route
router.post("/", isLoggedIn, upload, wrapAsync(async (req, res) => {
    try {
        const { title, description, price, category, locationID, newLocation, categoryData, locationType } = req.body;
        const files = req.files;
        const userID = req.user._id;


        if (!files || files.length === 0) {
            return res.status(400).send("No images were uploaded.");
        }

        // Process uploaded image URLs and filenames
        const images = files.map(file => ({
            url: file.path,   // Assuming 'path' contains the Cloudinary URL
            filename: file.filename   // Assuming 'filename' is the name of the file
        }));


        let categorySpecificData = {};

        // Fetch the categoryID from the category name
        const categoryDoc = await Category.findOne({ type: category });
        if (!categoryDoc) {
            return res.status(404).send('Category not found');
        }
        const categoryID = categoryDoc._id;

        let location;
        // Check location type and handle accordingly
        if (locationType === 'existing' && locationID) {
            // Use existing location
            location = await Location.findById(locationID);
            if (!location) {
                return res.status(404).send("Location not found");
            }
        } else if (locationType === 'new' && newLocation) {
            // Always create a new location when 'new' is selected
            if (!newLocation.country || !newLocation.state || !newLocation.city) {
                return res.status(400).send("Incomplete location data provided");
            }

            // Create new location with timestamp to ensure uniqueness
            location = new Location({
                country: newLocation.country,
                state: newLocation.state,
                city: newLocation.city,
                area: newLocation.area,
                zipCode: newLocation.zipCode,
                latitude: newLocation.latitude,
                longitude: newLocation.longitude,
                type: "product",
                createdAt: new Date(), // Add timestamp
                productSpecific: true   // Flag to indicate this is a product-specific location
            });

            // Save the new location
            await location.save();

            const user = await User.findById(userID);
            if (!user.locationID.includes(location._id)) {
                user.locationID.push(location._id);
                await user.save();
            }


        } else {
            return res.status(400).send("Invalid location data or type provided");
        }


        // Create the product 
        const newProduct = new Product({
            title,
            description,
            price,
            images,
            categoryID,
            locationID: location._id,
            userID,
        });

        const savedProduct = await newProduct.save();

        // Check if categoryData is provided and handle specific category logic
        if (category === 'fashion') {
            const { type } = categoryData;
            categorySpecificData = await createFashionData(type, savedProduct._id); // Pass productID from savedProduct
        } else if (category === 'electronics') {
            const { brandName, modelName, year, warranty, age } = categoryData;
            categorySpecificData = await createElectronicsData(brandName, modelName, year, warranty, age, savedProduct._id); // Pass productID
        } else if (category === 'pet') {
            const { type } = categoryData;
            categorySpecificData = await createPetData(type, savedProduct._id); // Pass productID
        } else if (category === 'other') {
            const { type } = categoryData;
            categorySpecificData = await createOtherData(type, savedProduct._id); // Pass productID
        } else if (category === 'property') {
            const { type, bhk, bathrooms, furnishing, areaSqft, carpetAreaSqft, bachelorsAllowed, totalFloors, carParkingSpace, facing, type2 } = categoryData;

            // Validate that all required fields for 'property' category are present
            if (!areaSqft || !carpetAreaSqft || !bachelorsAllowed || !totalFloors || !carParkingSpace) {
                return res.status(400).send('Missing required fields for property: areaSqft, carpetAreaSqft, bachelorsAllowed, totalFloors, carParkingSpace');
            }

            categorySpecificData = await createPropertyData({
                type,
                bhk,
                bathrooms,
                furnishing,
                areaSqft,
                carpetAreaSqft,
                bachelorsAllowed,
                totalFloors,
                carParkingSpace,
                facing,
                type2
            }, savedProduct._id); // Pass productID
        } else if (category === 'car/bike') {
            const { brandName, modelName, variantName, year, fuel, transmission, noOfOwners, kmDrived, age } = categoryData;
            categorySpecificData = await createCarBikeData(
                brandName,
                modelName,
                variantName,
                year,
                fuel,
                transmission,
                noOfOwners,
                kmDrived,
                age,
                savedProduct._id // Pass productID
            );
        }

        // After category-specific data is created, assign it to the new product
        savedProduct.categorySpecificData = categorySpecificData;

        // Save the product with the associated category data
        await savedProduct.save();

        res.redirect('/product/myads');

        // res.status(200).send('Product created successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
}));





// Route to search product (By input field & type)
router.get('/search', async (req, res) => {
    try {
        const { query, category, subType, searchBy } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        let products = [];
        let totalProducts = 0;

        // Handle text search
        if (query) {
            const searchQuery = {
                title: { $regex: query, $options: 'i' },
                isSold: false
            };
            
            // Get total count for pagination
            totalProducts = await Product.countDocuments(searchQuery);
            
            // Fetch paginated products
            products = await Product.find(searchQuery)
                .populate('locationID')
                .populate('categoryID')
                .populate('userID')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const hasMore = totalProducts > skip + products.length;
            
            // Handle AJAX requests
            if (req.xhr) {
                return res.json({ 
                    products, 
                    hasMore, 
                    currentPage: page 
                });
            }
            
            return res.render('listings/homepage.ejs', { 
                products,
                hasMore,
                currentPage: page,
                searchParams: req.query
            });
        }

        // Handle category-only search
        if (category && !subType && !searchBy) {
            // Find the category document
            const categoryDoc = await Category.findOne({ type: category });

            if (!categoryDoc) {
                req.flash('error', `Category not found: ${category}`);
                return res.redirect('/product');
            }

            const searchQuery = {
                categoryID: categoryDoc._id,
                isSold: false
            };
            
            // Get total count for pagination
            totalProducts = await Product.countDocuments(searchQuery);
            
            // Find all products for the specified category with pagination
            products = await Product.find(searchQuery)
                .populate('locationID')
                .populate('categoryID')
                .populate('userID')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            if (products.length === 0 && page === 1) {
                req.flash('error', 'No products found in this category.');
                return res.redirect('/product');
            }

            const hasMore = totalProducts > skip + products.length;
            
            // Handle AJAX requests
            if (req.xhr) {
                return res.json({ 
                    products, 
                    hasMore, 
                    currentPage: page 
                });
            }
            
            return res.render('listings/homepage.ejs', { 
                products,
                hasMore,
                currentPage: page,
                searchParams: req.query
            });
        }

        // Handle category and subType search
        if (category && subType) {
            // First find the category document
            const categoryDoc = await Category.findOne({ type: category });

            if (!categoryDoc) {
                req.flash('error', `Category not found: ${category}`);
                return res.redirect('/product');
            }

            let productIds = [];

            // If it's a pet category, find the pet document
            if (category === 'pet') {
                // Find all pets of the specified type
                const pets = await Pet.find({ type: subType });

                if (!pets || pets.length === 0) {
                    req.flash('error', `No pets found of type: ${subType}`);
                    return res.redirect('/product');
                }

                // Get all product IDs from the pets
                productIds = pets.map(pet => pet.productID);
            } else if (category === 'electronics') {
                // Find all electronics of the specified brand
                const electronics = await Electronics.find({ brandName: subType });

                if (!electronics || electronics.length === 0) {
                    req.flash('error', `No electronics found of brand: ${subType}`);
                    return res.redirect('/product');
                }

                // Get all product IDs from the electronics
                productIds = electronics.map(electronic => electronic.productID);
            } else if (category === 'car/bike') {
                // Build the search query based on searchBy parameter
                let searchQuery = {};
                if (searchBy === 'fuel') {
                    searchQuery = { fuel: subType };
                } else if (searchBy === 'transmission') {
                    searchQuery = { transmission: subType };
                }

                // Find vehicles based on the search criteria
                const carbikes = await CarBike.find(searchQuery);

                if (!carbikes || carbikes.length === 0) {
                    const searchType = searchBy === 'fuel' ? 'fuel type' : 'transmission type';
                    req.flash('error', `No vehicles found with ${searchType}: ${subType}`);
                    return res.redirect('/product');
                }

                // Get all product IDs from the vehicles
                productIds = carbikes.map(carbike => carbike.productID)
                    .filter(id => id != null); // Filter out any null IDs
            } else if (category === 'fashion') {
                // Find all fashion items of the specified type
                const fashions = await Fashion.find({ type: subType });

                if (!fashions || fashions.length === 0) {
                    req.flash('error', `No fashion products found of type: ${subType}`);
                    return res.redirect('/product');
                }

                // Get all product IDs from the fashion items
                productIds = fashions.map(fashion => fashion.productID);
            } else if (category === 'other') {
                // Find all other items of the specified type
                const others = await Other.find({ type: subType });

                if (!others || others.length === 0) {
                    req.flash('error', `No products found of type: ${subType}`);
                    return res.redirect('/product');
                }

                // Get all product IDs from the other items
                productIds = others.map(other => other.productID);
            } else if (category === 'property') {
                // Build the search query based on searchBy parameter
                let searchQuery = {};
                if (searchBy === 'type') {
                    searchQuery = { type: subType };
                } else if (searchBy === 'bhk') {
                    searchQuery = { bhk: subType };
                }

                // Find properties based on the search criteria
                const properties = await Property.find(searchQuery);

                if (!properties || properties.length === 0) {
                    const searchType = searchBy === 'type' ? 'property type' : 'BHK';
                    req.flash('error', `No properties found with ${searchType}: ${subType}`);
                    return res.redirect('/product');
                }

                // Get all product IDs from the properties
                productIds = properties.map(property => property.productID)
                    .filter(id => id != null); // Filter out any null IDs
            } else {
                // For other categories, just use the category ID for searching
                const searchQuery = {
                    categoryID: categoryDoc._id,
                    isSold: false
                };
                
                // Get total count for pagination
                totalProducts = await Product.countDocuments(searchQuery);
                
                // Find products with pagination
                products = await Product.find(searchQuery)
                    .populate('locationID')
                    .populate('categoryID')
                    .populate('userID')
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 });

                if (products.length === 0 && page === 1) {
                    req.flash('error', 'No products found in this category.');
                    return res.redirect('/product');
                }

                const hasMore = totalProducts > skip + products.length;
                
                // Handle AJAX requests
                if (req.xhr) {
                    return res.json({ 
                        products, 
                        hasMore, 
                        currentPage: page 
                    });
                }
                
                return res.render('listings/homepage.ejs', { 
                    products,
                    hasMore,
                    currentPage: page,
                    searchParams: req.query
                });
            }

            // If we got product IDs from a specific subcategory search
            if (productIds.length > 0) {
                const searchQuery = {
                    _id: { $in: productIds },
                    categoryID: categoryDoc._id,
                    isSold: false
                };
                
                // Get total count for pagination
                totalProducts = await Product.countDocuments(searchQuery);
                
                // Find products with pagination
                products = await Product.find(searchQuery)
                    .populate('locationID')
                    .populate('categoryID')
                    .populate('userID')
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 });

                if (products.length === 0 && page === 1) {
                    req.flash('error', 'No products found for this category and type.');
                    return res.redirect('/product');
                }

                const hasMore = totalProducts > skip + products.length;
                
                // Handle AJAX requests
                if (req.xhr) {
                    return res.json({ 
                        products, 
                        hasMore, 
                        currentPage: page 
                    });
                }
                
                return res.render('listings/homepage.ejs', { 
                    products,
                    hasMore,
                    currentPage: page,
                    searchParams: req.query
                });
            }
        }

        // If no search criteria provided
        req.flash('error', 'Please provide search criteria.');
        return res.redirect('/product');

    } catch (error) {
        console.error('Search error:', error);
        if (req.xhr) {
            return res.status(500).json({ error: 'Server error' });
        }
        req.flash('error', 'An error occurred while searching.');
        return res.redirect('/product');
    }
});











// // Route to search product (By input feild & type)
// router.get('/search', async (req, res) => {
//     try {
//         const { query, category, subType, searchBy } = req.query;

        
//         // Handle text search
//         if (query) {
//             const products = await Product.find({
//                 title: { $regex: query, $options: 'i' },
//                 isSold: false
//             })
//                 .populate('locationID')
//                 .populate('categoryID')
//                 .populate('userID');

//                 return res.render('listings/homepage.ejs', { products });
//             }


//         // Handle category-only search
//         if (category && !subType && !searchBy) {
//             // Find the category document
//             const categoryDoc = await Category.findOne({ type: category });

//             if (!categoryDoc) {
//                 req.flash('error', `Category not found: ${category}`);
//                 return res.redirect('/product');
//             }

//             // Find all products for the specified category
//             const products = await Product.find({
//                 categoryID: categoryDoc._id,
//                 isSold: false
//             })
//                 .populate('locationID')
//                 .populate('categoryID')
//                 .populate('userID');

//             if (products.length === 0) {
//                 req.flash('error', 'No products found in this category.');
//                 return res.redirect('/product');
//             }

//             return res.render('listings/homepage.ejs', { products });
//         }


//         // Handle category and subType search
//         if (category && subType) {
//             // First find the category document
//             const categoryDoc = await Category.findOne({ type: category });

//             if (!categoryDoc) {
//                 req.flash('error', `Category not found: ${category}`);
//                 return res.redirect('/product');
//             }

//             // If it's a pet category, find the pet document
//             if (category === 'pet') {
//                 // Find all pets of the specified type
//                 const pets = await Pet.find({ type: subType });

//                 if (!pets || pets.length === 0) {
//                     req.flash('error', `No pets found of type: ${subType}`);
//                     return res.redirect('/product');
//                 }

//                 // Get all product IDs from the pets
//                 const productIds = pets.map(pet => pet.productID);

//                 // Find all products that match these IDs and the category
//                 const products = await Product.find({
//                     _id: { $in: productIds },
//                     categoryID: categoryDoc._id,
//                     isSold: false
//                 })
//                     .populate('locationID')
//                     .populate('categoryID')
//                     .populate('userID');

//                 if (products.length === 0) {
//                     req.flash('error', 'No products found for this category and type.');
//                     return res.redirect('/product');
//                 }

//             return res.render('listings/homepage.ejs', { products });

//             }


//             if (category === 'electronics') {
//                 // Find all pets of the specified type
//                 const electronics = await Electronics.find({ brandName: subType });

//                 if (!electronics || electronics.length === 0) {
//                     req.flash('error', `No pets found of type: ${subType}`);
//                     return res.redirect('/product');
//                 }

//                 // Get all product IDs from the pets
//                 const productIds = electronics.map(electronic => electronic.productID);

//                 // Find all products that match these IDs and the category
//                 const products = await Product.find({
//                     _id: { $in: productIds },
//                     categoryID: categoryDoc._id,
//                     isSold: false
//                 })
//                     .populate('locationID')
//                     .populate('categoryID')
//                     .populate('userID');

//                 if (products.length === 0) {
//                     req.flash('error', 'No products found for this category and type.');
//                     return res.redirect('/product');
//                 }

//                 return res.render('listings/homepage.ejs', { products });
//             }

//             if (category === 'car/bike') {
//                 const categoryDoc = await Category.findOne({ type: category });

//                 if (!categoryDoc) {
//                     req.flash('error', `Category not found: ${category}`);
//                     return res.redirect('/product');
//                 }

//                 // Build the search query based on searchBy parameter
//                 let searchQuery = {};
//                 if (searchBy === 'fuel') {
//                     searchQuery = { fuel: subType };
//                 } else if (searchBy === 'transmission') {
//                     searchQuery = { transmission: subType };
//                 }

//                 // Find vehicles based on the search criteria
//                 const carbikes = await CarBike.find(searchQuery);

//                 console.log('Found vehicles:', carbikes); // Debug log

//                 if (!carbikes || carbikes.length === 0) {
//                     const searchType = searchBy === 'fuel' ? 'fuel type' : 'transmission type';
//                     req.flash('error', `No vehicles found with ${searchType}: ${subType}`);
//                     return res.redirect('/product');
//                 }

//                 // Get all product IDs from the vehicles
//                 const productIds = carbikes.map(carbike => carbike.productID)
//                     .filter(id => id != null); // Filter out any null IDs

//                 // Find all products that match these IDs and the category
//                 const products = await Product.find({
//                     _id: { $in: productIds },
//                     categoryID: categoryDoc._id,
//                     isSold: false
//                 })
//                     .populate('locationID')
//                     .populate('categoryID')
//                     .populate('userID');

//                 if (products.length === 0) {
//                     req.flash('error', 'No products found for this category and type.');
//                     return res.redirect('/product');
//                 }

//                 return res.render('listings/homepage.ejs', { products });
//             }

//             if (category === 'fashion') {
//                 // Find all pets of the specified type
//                 const fashions = await Fashion.find({ type: subType });

//                 if (!fashions || fashions.length === 0) {
//                     req.flash('error', `No fashion products found of type: ${subType}`);
//                     return res.redirect('/product');
//                 }

//                 // Get all product IDs from the pets
//                 const productIds = fashions.map(fashion => fashion.productID);

//                 // Find all products that match these IDs and the category
//                 const products = await Product.find({
//                     _id: { $in: productIds },
//                     categoryID: categoryDoc._id,
//                     isSold: false
//                 })
//                     .populate('locationID')
//                     .populate('categoryID')
//                     .populate('userID');

//                 if (products.length === 0) {
//                     req.flash('error', 'No products found for this category and type.');
//                     return res.redirect('/product');
//                 }

//                 return res.render('listings/homepage.ejs', { products });
//             }

//             if (category === 'other') {
//                 // Find all pets of the specified type
//                 const others = await Other.find({ type: subType });

//                 if (!others || others.length === 0) {
//                     req.flash('error', `No products found of type: ${subType}`);
//                     return res.redirect('/product');
//                 }

//                 // Get all product IDs from the pets
//                 const productIds = others.map(other => other.productID);

//                 // Find all products that match these IDs and the category
//                 const products = await Product.find({
//                     _id: { $in: productIds },
//                     categoryID: categoryDoc._id,
//                     isSold: false
//                 })
//                     .populate('locationID')
//                     .populate('categoryID')
//                     .populate('userID');

//                 if (products.length === 0) {
//                     req.flash('error', 'No products found for this category and type.');
//                     return res.redirect('/product');
//                 }

//                 return res.render('listings/homepage.ejs', { products });
//             }



//             if (category === 'property') {
//                 const categoryDoc = await Category.findOne({ type: category });

//                 if (!categoryDoc) {
//                     req.flash('error', `Category not found: ${category}`);
//                     return res.redirect('/product');
//                 }

//                 // Build the search query based on searchBy parameter
//                 let searchQuery = {};
//                 if (searchBy === 'type') {
//                     searchQuery = { type: subType };
//                 } else if (searchBy === 'bhk') {
//                     searchQuery = { bhk: subType };
//                 }

//                 // Find properties based on the search criteria
//                 const properties = await Property.find(searchQuery);

//                 console.log('Search criteria:', searchQuery); // Debug log
//                 console.log('Found properties:', properties); // Debug log

//                 if (!properties || properties.length === 0) {
//                     const searchType = searchBy === 'type' ? 'property type' : 'BHK';
//                     req.flash('error', `No properties found with ${searchType}: ${subType}`);
//                     return res.redirect('/product');
//                 }

//                 // Get all product IDs from the properties
//                 const productIds = properties.map(property => property.productID)
//                     .filter(id => id != null); // Filter out any null IDs

//                 // Find all products that match these IDs and the category
//                 const products = await Product.find({
//                     _id: { $in: productIds },
//                     categoryID: categoryDoc._id,
//                     isSold: false
//                 })
//                     .populate('locationID')
//                     .populate('categoryID')
//                     .populate('userID');

//                 if (products.length === 0) {
//                     req.flash('error', 'No products found for this category and type.');
//                     return res.redirect('/product');
//                 }

//                 return res.render('listings/homepage.ejs', { products });
//             }


//             // For other categories (cars, etc.)
//             const products = await Product.find({
//                 categoryID: categoryDoc._id,
//                 isSold: false
//             })
//                 .populate('locationID')
//                 .populate('categoryID')
//                 .populate('userID');

//             if (products.length === 0) {
//                 req.flash('error', 'No products found in this category.');
//                 return res.redirect('/product');
//             }

//             return res.render('listings/homepage.ejs', { products });
//         }


//         // If no search criteria provided
//         req.flash('error', 'Please provide search criteria.');
//         return res.redirect('/product');

//     } catch (error) {
//         console.error('Search error:', error);
//         req.flash('error', 'An error occurred while searching.');
//         return res.redirect('/product');
//     }
// });

// Add product to comparison list
router.post("/:productID/compare/add", isLoggedIn, wrapAsync(async (req, res) => {
    const { productID } = req.params;
    const userID = req.user._id;

    // Fetch the product and its category
    const productToAdd = await Product.findById(productID).populate('categoryID');
    if (!productToAdd) {
        return res.status(404).send("Product not found");
    }

    // Check if there are existing products in the comparison list
    const existingComparison = await Comparison.findOne({ userID }).populate({
        path: 'productID',
        populate: { path: 'categoryID' }
    });

    if (existingComparison) {
        // Check if the product is already in the list
        const duplicate = await Comparison.findOne({ userID, productID });
        if (duplicate) {
            req.flash('info', 'Product is already in the comparison list');
            return res.redirect(`/product/${productID}`);
        }

        const existingCategory = existingComparison.productID.categoryID.type;

        // If categories match, add the new product
        if (productToAdd.categoryID.type === existingCategory) {
            await Comparison.create({ userID, productID });
        } else {
            // If categories don't match, delete existing product and add new one
            await Comparison.deleteMany({});
            await Comparison.create({ userID, productID });
            req.flash(
                'error',
                'Products from a different category were discarded. New product added to the comparison list.'
            );
        }
    } else {
        // If no existing comparison, simply add the new product
        await Comparison.create({ userID, productID });
    }

    req.flash('success', 'Product added to comparison list');
    res.redirect(`/product/${productID}`);
}));


router.delete("/:productID/compare/remove", isLoggedIn, wrapAsync(async (req, res) => {
    const { productID } = req.params;
    const userID = req.user._id;

    // Check if the product exists in the user's comparison list
    const comparisonItem = await Comparison.findOne({ userID, productID });

    if (!comparisonItem) {
        return res.status(404).send("Product not found in comparison list");
    }

    // Remove the product from the comparison list
    await Comparison.deleteOne({ userID, productID });

    req.flash('success', 'Product removed from comparison list');
    res.redirect("/product/compare"); 
}));

// Fetch and display products in the comparison list
router.get('/compare', async (req, res) => {
    const userID = req.user._id;

    if (!userID) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    try {
        const comparisonEntries = await Comparison.find({ userID })
            .populate({
                path: 'productID', // Populate the product details
                populate: [
                    { path: 'categoryID' }, // Populate all fields of categoryID
                    { path: 'locationID' } // Populate all fields of locationID
                ]
            });

        if (!comparisonEntries || comparisonEntries.length === 0) {
            return res.status(404).send('No products in comparison list.');
        }

        // Extract the populated products
        const products = [];
        for (let i = 0; i < comparisonEntries.length; i++) {
            products.push(comparisonEntries[i].productID);
        }

        // Prepare category-specific data for each product
        const categorySpecificData = [];
        for (const product of products) {
            let data = {};
            if (product.categoryID.type === "fashion") {
                data = await Fashion.findOne({ productID: product._id });
            } else if (product.categoryID.type === "car/bike") {
                data = await CarBike.findOne({ productID: product._id });
            } else if (product.categoryID.type === "property") {
                data = await Property.findOne({ productID: product._id });
            } else if (product.categoryID.type === "electronics") {
                data = await Electronics.findOne({ productID: product._id });
            } else if (product.categoryID.type === "pet") {
                data = await Pet.findOne({ productID: product._id });
            } else if (product.categoryID.type === "other") {
                data = await Other.findOne({ productID: product._id });
            }

            // Add the product ID and its category-specific data to the array
            categorySpecificData.push({
                productID: product._id,
                categoryData: data,
            });
        }

        // Render the comparison page
        res.render('listings/compare.ejs', { products, categorySpecificData });

    } catch (error) {
        console.error('Error fetching comparison products:', error);
        res.status(500).send('Internal Server Error');
    }
});







//Route to Display my Ads
router.get("/myads", isLoggedIn, wrapAsync(async (req, res) => {
    try {
        const userID = req.user._id;
        const filterType = req.query.filter; // Get filter from query parameter
        
        // Base query for all products
        let query = { userID };
        
        // Apply filter if specified
        if (filterType === 'active') {
            query.isSold = false;
        } else if (filterType === 'sold') {
            query.isSold = true;
        }
        
        // Fetch products based on the query with filter applied
        const products = await Product.find(query)
            .populate('categoryID')
            .populate('locationID')
            .populate('userID')
            .sort({ createdAt: -1 })
            .exec();
            
        // Fetch all products to calculate counts
        const allProducts = await Product.find({ userID }).exec();
        const activeCount = allProducts.filter(product => !product.isSold).length;
        const soldCount = allProducts.filter(product => product.isSold).length;

        // Get user information
        const user = req.user;

        // Handle case when no products are found
        if (allProducts.length === 0) {
            return res.render('listings/myads.ejs', { 
                products: [],
                activeCount: 0,
                soldCount: 0,
                totalCount: 0,
                user,
                filterType,
                noProductsMessage: 'No products found.'
            });
        }

        // Render the view with products, counts, user data and filter info
        res.render('listings/myads.ejs', { 
            products,
            activeCount,
            soldCount,
            totalCount: allProducts.length,
            user,
            filterType
        });


    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
}));

// Route to show product in detail.
router.get("/:productID", isLoggedIn, wrapAsync(async (req, res) => {

    const { productID } = req.params;
    const userID = req.user._id;

    // Fetch product from the database
    const product = await Product.findById(productID).populate('categoryID').populate('locationID').populate('userID');
    if (!product) {
        return res.status(404).send("Product not found");
    }

    // Fetch category-specific data if required
    let categorySpecificData = {};
    if (product.categoryID.type === "fashion") {
        categorySpecificData = await Fashion.findOne({ productID });
    } else if (product.categoryID.type === "car/bike") {
        categorySpecificData = await CarBike.findOne({ productID });
    } else if (product.categoryID.type === "property") {
        categorySpecificData = await Property.findOne({ productID });
    } else if (product.categoryID.type === "electronics") {
        categorySpecificData = await Electronics.findOne({ productID });
    } else if (product.categoryID.type === "pet") {
        categorySpecificData = await Pet.findOne({ productID });
    } else if (product.categoryID.type === "other") {
        categorySpecificData = await Other.findOne({ productID });
    }

    // Check if a Favourite entry exists for the product
    const favourite = await Favourite.findOne({ productID, userID, isFavourite: true });
    const isFavourite = favourite ? true : false;


    // Check if the product is in the comparison list
    const comparisonEntry = await Comparison.findOne({ productID, userID });
    const isInComparisonList = comparisonEntry ? true : false;


    // Render the view with product and category-specific data
    res.render("listings/showProduct.ejs", {
        product,
        categorySpecificData,
        seller: product.userID,
        isFavourite,
        isInComparisonList,
    });

}));










// Edit Product
router.get("/:productID/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { productID } = req.params;

    // Validate the productID to ensure it's a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productID)) {
        return res.status(400).send("Invalid product ID format");
    }

    // Find the product to edit by its ObjectId (_id) and populate the category
    const product = await Product.findById(productID).populate('categoryID');

    if (!product) {
        return res.status(404).send("Product not found");
    }

    // Fetch all categories for the dropdown (optional if you want to display all categories somewhere else)
    const categorys = await Category.find();

    // Initialize category-specific details
    let categoryDetails = {};

    // Determine the category type and fetch relevant details
    if (product.categoryID.type === 'car/bike') {
        categoryDetails = await CarBike.findOne({ productID: product._id });
    } else if (product.categoryID.type === 'electronics') {
        categoryDetails = await Electronics.findOne({ productID: product._id });
    } else if (product.categoryID.type === 'pet') {
        categoryDetails = await Pet.findOne({ productID: product._id });
    } else if (product.categoryID.type === 'other') {
        categoryDetails = await Other.findOne({ productID: product._id });
    } else if (product.categoryID.type === 'property') {
        categoryDetails = await Property.findOne({ productID: product._id });
    } else if (product.categoryID.type === 'fashion') {
        categoryDetails = await Fashion.findOne({ productID: product._id });
    }

    // Render the edit form with all details
    res.render('listings/editProduct.ejs', {
        product,
        categorys,       // All categories for the dropdown (if needed)
        categoryDetails, // Category-specific details
    });
}));



router.put("/:id", upload, wrapAsync(async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            price,
            categoryData // This contains the category-specific fields
        } = req.body;

        // Find the product and populate only categoryID
        const product = await Product.findById(id).populate('categoryID');

        if (!product) {
            return res.status(404).send("Product not found");
        }

        // Handle image updates if files were uploaded
        let images = product.images;
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({
                url: file.path,
                filename: file.filename
            }));
            images = [...images, ...newImages];
        }

        const categoryType = product.categoryID.type;
        let updatedCategoryData = {};

        // Build category-specific update data based on type
        if (categoryType === 'car/bike') {
            updatedCategoryData = {
                brandName: req.body.brandName,
                modelName: req.body.modelName,
                variantName: req.body.variantName,
                year: parseInt(req.body.year),
                kmDrived: parseInt(req.body.kmDrived),
                fuel: req.body.fuel,
                transmission: req.body.transmission,
                age: parseInt(req.body.age),
                noOfOwners: parseInt(req.body.noOfOwners)
            };
        }
        else if (categoryType === 'electronics') {
            updatedCategoryData = {
                brandName: req.body.brandName,
                modelName: req.body.modelName,
                year: parseInt(req.body.year),
                warranty: req.body.warranty,
                age: parseInt(req.body.age)
            };
        }
        else if (categoryType === 'pet') {
            updatedCategoryData = {
                type: categoryData.type
            };
        }
        else if (categoryType === 'property') {
            updatedCategoryData = {
                type: categoryData.type,
                bhk: parseInt(categoryData.bhk),
                bathrooms: parseInt(categoryData.bathrooms),
                furnishing: categoryData.furnishing,
                areaSqft: parseInt(categoryData.areaSqft),
                carpetAreaSqft: parseInt(categoryData.carpetAreaSqft),
                bachelorsAllowed: categoryData.bachelorsAllowed === 'true',
                totalFloors: parseInt(categoryData.totalFloors),
                carParkingSpace: parseInt(categoryData.carParkingSpace),
                facing: categoryData.facing,
                type2: categoryData.type2
            };
        }
        else if (categoryType === 'fashion') {
            updatedCategoryData = {
                type: categoryData.type
            };
        }
        else if (categoryType === 'other') {
            updatedCategoryData = {
                type: categoryData.type
            };
        }

        // Update the main product including category specific data
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                title,
                description,
                price: parseInt(price),
                images,
                categorySpecificData: updatedCategoryData,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!updatedProduct) {
            throw new Error('Failed to update product');
        }

        // Redirect back to the product page
        req.flash("success", "Information Updated!");

        res.redirect("/product");

    } catch (error) {
        console.error('Update error:', error);
        res.status(500).send(`Server error: ${error.message}`);
    }
}));


// Delete Product
router.delete("/:productID/delete", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { productID } = req.params;

    // Validate the productID to ensure it's a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productID)) {
        return res.status(400).send("Invalid product ID format");
    }

    // Find the product to delete by its ObjectId (_id)
    const product = await Product.findById(productID);

    if (!product) {
        return res.status(404).send("Product not found");
    }

    // Find the category associated with the product
    const categoryID = product.categoryID; // Assuming `categoryID` is in the product schema
    const category = await Category.findById(categoryID);

    if (!category) {
        return res.status(404).send("Category not found");
    }

    if (Array.isArray(category.productID)) {
        category.productID = category.productID.filter(id => id.toString() !== productID);
    } else {
        category.productID = null;
    }
    await category.save();

    const categoryType = category.type;

    let modelToDelete;
    if (categoryType === 'car/bike') {
        modelToDelete = CarBike;
    } else if (categoryType === 'electronics') {
        modelToDelete = Electronics;
    } else if (categoryType === 'pet') {
        modelToDelete = Pet;
    } else if (categoryType === 'other') {
        modelToDelete = Other;
    } else if (categoryType === 'property') {
        modelToDelete = Property;
    } else if (categoryType === 'fashion') {
        modelToDelete = Fashion;
    }

    if (modelToDelete) {
        await modelToDelete.findOneAndDelete({ productID: productID });
    }


    await Product.findByIdAndDelete(productID);

    req.flash("success", "Product Deleted!");

    res.redirect("/product/myads");
}));

// Route to update the isSold status of the product
router.put("/:productID/sold", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const product = await Product.findById(req.params.productID);
    if (!product) {
        req.flash('error', 'Product not found.');
        return res.redirect('/product');
    }
    // Toggle the 'isSold' status
    product.isSold = !product.isSold;
    await product.save();
    req.flash('success', 'Product sold status updated successfully');
    res.redirect(`/product/myads`);  // Redirect to the product details page
}));





module.exports = router;




// Show Product Route
// router.get("/:productID", isLoggedIn, wrapAsync(async (req, res) => {



//     const { productID } = req.params;

//     // Fetch product from the database
//     const product = await Product.findById(productID).populate('categoryID').populate('locationID').populate('userID');
//     if (!product) {
//         return res.status(404).send("Product not found");
//     }

//     // Fetch category-specific data if required
//     let categorySpecificData = {};
//     if (product.categoryID.type === "fashion") {
//         categorySpecificData = await Fashion.findOne({ productID });
//     } else if (product.categoryID.type === "car/bike") {
//         categorySpecificData = await CarBike.findOne({ productID });
//     } else if (product.categoryID.type === "property") {
//         categorySpecificData = await Property.findOne({ productID });
//     } else if (product.categoryID.type === "electronics") {
//         categorySpecificData = await Electronics.findOne({ productID });
//     } else if (product.categoryID.type === "pet") {
//         categorySpecificData = await Pet.findOne({ productID });
//     } else if (product.categoryID.type === "other") {
//         categorySpecificData = await Other.findOne({ productID });
//     }

//    // Check if a Favourite entry exists for the product
//    const favourite = await Favourite.findOne({ productID });
//    const isFavourite = favourite ? favourite.isFavourite : false;

//     // Render the view with product and category-specific data
//     res.render("listings/showProduct.ejs", {
//         product,
//         categorySpecificData,
//         seller: product.userID,
//         isFavourite,
//     });

// }));


// // Update route
// router.put("/:productID", upload, wrapAsync(async (req, res) => {
//     const { productID } = req.params;
//     const { title, description, price, category, categoryData } = req.body;
//     const files = req.files;

//     // Validate the productID
//     if (!mongoose.Types.ObjectId.isValid(productID)) {
//         return res.status(400).send("Invalid product ID format");
//     }

//     // Find the product to update
//     const product = await Product.findById(productID).populate('categoryID');

//     if (!product) {
//         return res.status(404).send("Product not found");
//     }

//     // Process uploaded images
//     if (files && files.length > 0) {
//         product.images = files.map(file => ({
//             url: file.path,
//             filename: file.filename
//         }));
//     }

//     // Update basic product details
//     if (title) product.title = title;
//     if (description) product.description = description;
//     if (price) product.price = price;

//     // Debug logging
//     console.log('Received category:', category);
//     console.log('Received categoryData:', categoryData);

//     // Comprehensive category-specific data update
//     try {
//         let categorySpecificData;
//         switch(category) {
//             case 'fashion':
//                 if (!categoryData || !categoryData.type) {
//                     throw new Error('Missing type for fashion category');
//                 }
//                 // Update fashion type
//                 categorySpecificData = await updateFashionData(categoryData.type, product._id);
//                 break;
//             case 'electronics':
//                 const { brandName, modelName, year, warranty, age } = categoryData || {};
//                 if (!brandName || !modelName) {
//                     throw new Error('Missing required electronics data');
//                 }
//                 categorySpecificData = await createElectronicsData(
//                     brandName, modelName, year, warranty, age, product._id
//                 );
//                 break;
//             case 'pet':
//                 if (!categoryData || !categoryData.type) {
//                     throw new Error('Missing type for pet category');
//                 }
//                 categorySpecificData = await createPetData(categoryData.type, product._id);
//                 break;
//             case 'property':
//                 const {
//                     type, bhk, bathrooms, furnishing, areaSqft,
//                     carpetAreaSqft, bachelorsAllowed, totalFloors,
//                     carParkingSpace, facing, type2
//                 } = categoryData || {};

//                 if (!areaSqft || !carpetAreaSqft) {
//                     throw new Error('Missing required property data');
//                 }

//                 categorySpecificData = await createPropertyData({
//                     type, bhk, bathrooms, furnishing, areaSqft,
//                     carpetAreaSqft, bachelorsAllowed, totalFloors,
//                     carParkingSpace, facing, type2
//                 }, product._id);
//                 break;
//             case 'car/bike':
//                 const {
//                     brandName: cbBrandName, modelName: cbModelName,
//                     variantName, year: cbYear, fuel, transmission,
//                     noOfOwners, kmDrived, age: cbAge
//                 } = categoryData || {};

//                 if (!cbBrandName || !cbModelName) {
//                     throw new Error('Missing required car/bike data');
//                 }

//                 categorySpecificData = await createCarBikeData(
//                     cbBrandName, cbModelName, variantName, cbYear,
//                     fuel, transmission, noOfOwners, kmDrived,
//                     cbAge, product._id
//                 );
//                 break;
//             case 'other':
//                 if (!categoryData || !categoryData.type) {
//                     throw new Error('Missing type for other category');
//                 }
//                 categorySpecificData = await createOtherData(categoryData.type, product._id);
//                 break;
//             default:
//                 console.warn(`Unhandled category: ${category}`);
//                 break;
//         }

//         // Only update if categorySpecificData is not undefined
//         if (categorySpecificData) {
//             product.categorySpecificData = categorySpecificData;
//         }
//     } catch (error) {
//         console.error('Category-specific data update error:', error);
//         return res.status(400).send(`Error updating category data: ${error.message}`);
//     }

//     // Save the updated product
//     await product.save();

//     res.status(200).json({
//         message: 'Product updated successfully',
//         updatedProduct: product
//     });
// }));




// // Update Product
// router.put("/:productID", upload, wrapAsync(async (req, res) => {
//     const { productID } = req.params;
//     const { title, description, price, category, locationID, newLocation, categoryData, locationType } = req.body;
//     const files = req.files;

//     // Validate the productID to ensure it's a valid ObjectId
//     if (!mongoose.Types.ObjectId.isValid(productID)) {
//         return res.status(400).send("Invalid product ID format");
//     }

//     // Find the product to update by its ObjectId (_id)
//     const product = await Product.findById(productID).populate('categoryID');

//     if (!product) {
//         return res.status(404).send("Product not found");
//     }

//     // Process uploaded image URLs and filenames if any files are provided
//     let images = product.images;  // Keep the existing images by default
//     if (files && files.length > 0) {
//         images = files.map(file => ({
//             url: file.path,  // Assuming 'path' contains the Cloudinary URL
//             filename: file.filename  // Assuming 'filename' is the name of the file
//         }));
//     }

//     // let location;
//     // // Check location type and handle accordingly
//     // if (locationType === 'existing' && locationID) {
//     //     // Use existing location
//     //     location = await Location.findById(locationID);
//     //     if (!location) {
//     //         return res.status(404).send("Location not found");
//     //     }
//     // } else if (locationType === 'new' && newLocation) {
//     //     // Always create a new location when 'new' is selected
//     //     if (!newLocation.country || !newLocation.state || !newLocation.city) {
//     //         return res.status(400).send("Incomplete location data provided");
//     //     }

//     //     // Create new location with timestamp to ensure uniqueness
//     //     location = new Location({
//     //         country: newLocation.country,
//     //         state: newLocation.state,
//     //         city: newLocation.city,
//     //         area: newLocation.area,
//     //         zipCode: newLocation.zipCode,
//     //         type: "product",
//     //         createdAt: new Date(), // Add timestamp
//     //         productSpecific: true   // Flag to indicate this is a product-specific location
//     //     });

//     //     // Save the new location
//     //     await location.save();
//     // } else {
//     //     return res.status(400).send("Invalid location data or type provided");
//     // }

//     // Update the product details
//     product.title = title || product.title;
//     product.description = description || product.description;
//     product.price = price || product.price;
//     product.images = images;
//     // product.locationID = location._id;

//     // Update category-specific data (if provided)
//     let categorySpecificData = product.categorySpecificData;
//     if (category === 'fashion') {
//         const { type } = categoryData;
//         categorySpecificData = await updateFashionData(type, product._id); // Pass productID from product
//     } else if (category === 'electronics') {
//         const { brandName, modelName, year, warranty, age } = categoryData;
//         categorySpecificData = await createElectronicsData(brandName, modelName, year, warranty, age, product._id); // Pass productID
//     } else if (category === 'pet') {
//         const { type } = categoryData;
//         categorySpecificData = await createPetData(type, product._id); // Pass productID
//     } else if (category === 'other') {
//         const { type } = categoryData;
//         categorySpecificData = await createOtherData(type, product._id); // Pass productID
//     } else if (category === 'property') {
//         const { type, bhk, bathrooms, furnishing, areaSqft, carpetAreaSqft, bachelorsAllowed, totalFloors, carParkingSpace, facing, type2 } = categoryData;

//         // Validate that all required fields for 'property' category are present
//         if (!areaSqft || !carpetAreaSqft || !bachelorsAllowed || !totalFloors || !carParkingSpace) {
//             return res.status(400).send('Missing required fields for property: areaSqft, carpetAreaSqft, bachelorsAllowed, totalFloors, carParkingSpace');
//         }

//         categorySpecificData = await createPropertyData({
//             type,
//             bhk,
//             bathrooms,
//             furnishing,
//             areaSqft,
//             carpetAreaSqft,
//             bachelorsAllowed,
//             totalFloors,
//             carParkingSpace,
//             facing,
//             type2
//         }, product._id); // Pass productID
//     } else if (category === 'car/bike') {
//         const { brandName, modelName, variantName, year, fuel, transmission, noOfOwners, kmDrived, age } = categoryData;
//         categorySpecificData = await createCarBikeData(
//             brandName,
//             modelName,
//             variantName,
//             year,
//             fuel,
//             transmission,
//             noOfOwners,
//             kmDrived,
//             age,
//             product._id // Pass productID
//         );
//     }

//     // After category-specific data is updated, assign it to the product
//     product.categorySpecificData = categorySpecificData;

//     // Save the updated product
//     await product.save();

//     res.status(200).send('Product updated successfully');
// }));
