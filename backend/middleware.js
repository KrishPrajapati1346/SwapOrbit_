const Product = require("./models/product.js");

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;   // to give the old path after being login
        req.flash("error" ,"please Login first to perform action!");
        return res.redirect("/login");
      }
      next();
};

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
      res.locals.redirectUrl = req.session.redirectUrl;
    }
    next(); 
  };




  module.exports.isOwner = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.productID);

        if (!product) {
            req.flash("error", "Product not found");
            return res.redirect('/product');
        }
        if (!product.userID.equals(req.user._id.toString())) {
            req.flash("error", "You do not have permission to perform this action");
            console.log("You do not have permission to perform this action");
            return res.redirect('/product');
        }

        next();
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong");
        res.redirect('/product');
    }
};


