




if(process.env.NODE_ENV != "production"){
    require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
}



const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// signup/login
const LocalStrategy = require("passport-local");
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;


// Models
const Category = require("./models/category");
const Product = require("./models/product");
const CarBike = require("./models/carBike");
const Electronics = require("./models/electronics");
const Fashion = require("./models/fashion");
const Favourite = require("./models/favourite");
const Location = require("./models/location");
const Other = require("./models/other");
const Pet = require("./models/pet");
const Property = require("./models/property");
const User = require("./models/user");
const ArchivedUser = require("./models/archivedUser");



//Routes
const categorys = require("./routes/category.js");
const products = require("./routes/product.js");
const fashions = require("./routes/fashion.js");
const users = require("./routes/user.js");
const favourites = require("./routes/favourite.js");
const privacy = require("./routes/privacy.js");
const archivedUsers = require("./routes/archivedUser.js");
const about = require("./routes/about.js");







app.set("view engine" , "ejs");
app.set("views" ,path.join(__dirname,"../frontend/views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"../frontend/public")))
app.engine("ejs",ejsMate); 




//connection to db
main().then(() =>{
    console.log("Connection Successful");
})
.catch(err => console.log(err));

async function main() {
    await mongoose.connect(process.env.ATLASDB_URL);

    // await mongoose.connect('mongodb://127.0.0.1/swaporbit');
}


const store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});


store.on("error" , () => {
    console.log("Error in mongo session store ", err);
});

app.use(session({
    store,
    secret: process.env.SECRET, 
    resave:false ,
    saveUninitialized:true,
    cookie: {
      expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge : 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,   
    }  
  }));



  app.use(flash());
  app.use(flash());
  

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(new GoogleStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:8080/auth/google/callback"
},
async function(accessToken, refreshToken, profile, done) {
  try {
      // Check if the user already exists in the database
      let user = await User.findOne({ email: profile.emails[0].value });

      if (!user) {
          // Create a new user if not found
          user = await User.create({
              username: profile.displayName,
              email: profile.emails[0].value,
           
          });
      }

      return done(null, user);
  } catch (err) {
    console.error("Error during Google login:", err); 
      return done(err, null);
  }
}));
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
    (req, res, next) => {
        console.log("Received callback from Google...");
        next();
    },
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
        if (req.user) {
            console.log(`User successfully logged in: ${req.user.username}`);
        } else {
            console.error("User object is null after authentication.");
        }
        res.redirect("/product");
    }
);

app.get("/dashboard", (req, res) => {
    if (req.isAuthenticated()) { 
        console.log(`Accessing dashboard for user: ${req.user.username}`);
        res.redirect("/product");
    } else {
        console.warn("Unauthorized access attempt to dashboard.");
        res.redirect("/");
    }
});





// // Passport Strategy
// passport.use(new LocalStrategy(User.authenticate()));

// // Serialize and Deserialize User
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;

//   res.locals.currUser = req.user || null;
  next();
});





app.get("/" , (req,res) => {
    res.redirect("/product")
});

app.use("/category", categorys);
app.use("/product", products);
app.use("/fashion", fashions);
app.use("/" , users);
app.use("/" , favourites);
app.use("/", privacy); 
app.use("/" , archivedUsers);
app.use("/" , about);









const port = process.env.PORT || 8080;
if (!process.env.VERCEL) {
    app.listen(port , () => {
        console.log(`Listening on port ${port}`);
    });
}

module.exports = app;


