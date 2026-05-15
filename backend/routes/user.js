const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const Location = require("../models/location");

const {saveRedirectUrl} = require("../middleware.js");

// Handle Image Upload
const { storage } = require("../cloudConfig.js");
const multer = require('multer');
const upload = multer({ storage });



// SignUp form
router.get("/signup",(req,res) => {
    res.render("users/signup.ejs");
});


// Add SignUp data
router.post(
    '/signup',upload.single('photo'),
    wrapAsync(async (req, res, next) => {
      try {
        const { username, email, phone, role, password, locationID, productID } = req.body;
        const photo = req.file;
        
        const newLocationObj = req.body.newLocation || {};
        const country = req.body['newLocation[country]'] || newLocationObj.country;
        const state = req.body['newLocation[state]'] || newLocationObj.state;
        const city = req.body['newLocation[city]'] || newLocationObj.city;
        const area = req.body['newLocation[area]'] || newLocationObj.area;
        const zipCode = req.body['newLocation[zipCode]'] || newLocationObj.zipCode;
        const latitude = req.body['newLocation[latitude]'] || newLocationObj.latitude;
        const longitude = req.body['newLocation[longitude]'] || newLocationObj.longitude;

        // Create a new location entry
        const newLocationEntry = new Location({
          country,
          state,
          city,
          area,
          zipCode,
          latitude,
          longitude,
          type: "user",

        });
  
        const savedLocation = await newLocationEntry.save();
        // Create a new user instance
        const newUser = new User({
          photo,
          username,
          email,
          phone,
          role,
          locationID:  [savedLocation._id],
          productID,
        });
  

        
        // Register the user and hash the password
        const registeredUser = await User.register(newUser, password);
  
        console.log(registeredUser);
  
        // Automatically log the user in after signup
        req.login(registeredUser, (err) => {
          if (err) return next(err);
  
          // Redirect to products page after successful signup
          res.redirect('/product');
        });
      } catch (err) {
        console.error(err);
  
        // Handle errors gracefully and redirect to signup page
        res.redirect('/signup');
      }
    }));



// Login form
router.get("/login",(req,res) => {
    res.render("users/login.ejs");
});



router.post("/login" ,
    saveRedirectUrl,
    passport.authenticate("local" , {failureRedirect:'/login' , failureFlash: true}) ,
    async(req,res) => {
    
        req.flash(`success` , `Welcome back!`);
        let redirectUrl = res.locals.redirectUrl || "/product";
        res.redirect(redirectUrl);
     
    });

router.get("/logout",(req,res,next) => {
    req.logOut((err) => {
        if(err){
            next(err);
        }
    req.flash("success" ,"You are logged out!" );
    res.redirect("/login");
    })
});





router.get("/profile",async(req,res) => {
  try{
    
  const userID = req.user._id;
  const user = await User.findById(userID); 
  
  res.render("users/view&updateProfile.ejs", {
  user 
  });

  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/view-update-profile", upload.single("photo"), async (req, res) => {
  try {
    const userID = req.user._id; // Get the logged-in user's ID
    const { phone, location, newLocation } = req.body; // Get phone, location, and newLocation from the form

    console.log(req.user);

    // Find the user by ID
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Update user phone if provided
    if (phone) user.phone = phone;

    // Handle new location entry
    if (newLocation && newLocation.country && newLocation.state && newLocation.city && newLocation.latitude && newLocation.longitude) {

      const { country, state, city, area, zipCode, latitude, longitude } = newLocation; // Parse newLocation if sent as JSON

      // Create a new location entry
      const newLocationEntry = new Location({
        country,
        state,
        city,
        area,
        zipCode,
        latitude,
        longitude,
        type: "user", // Setting the type for better identification
      });

      // Save the new location to the database
      const savedLocation = await newLocationEntry.save();

      // Push the saved location ID to the user's locationID array
      user.locationID.push(savedLocation._id);
    }

    // Handle photo update if provided
    if (req.file) {
      user.photo = { url: req.file.path, filename: req.file.filename };
    }

    // Save the updated user data
    await user.save();

    // Redirect to the profile view page with success message
    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
