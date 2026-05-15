const express = require('express');
const router = express.Router();
const Privacy = require('../models/user'); 
const wrapAsync = require("../utils/wrapAsync.js");

const Product = require("../models/product");
const User = require("../models/user");
const { isLoggedIn, saveRedirectUrl, isOwner } = require("../middleware.js");





router.get("/privacy", isLoggedIn, wrapAsync(async (req, res) => {
   
  const userID = req.user._id;
  const user = await User.findById(userID); 

  res.render("listings/privacy.ejs", {user});
}));



module.exports = router;
