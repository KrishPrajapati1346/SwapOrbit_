const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const wrapAsync = require("../utils/wrapAsync.js");


router.get("/about", wrapAsync(async (req, res) => {
    res.render("listings/about.ejs");
}));

module.exports = router;

