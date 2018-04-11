var express     = require("express");
// Esta linea de codigo es necesaria para nuestros archivos de rutas.
var router      =  express.Router();
var passport    = require("passport");
var User        = require("../models/user");
var Campground  = require("../models/campground");
// La razon por la cual no especificamos el nombre del archivo (index.js) es
// porque cuando nosotros hacemos un require de un archivo, si este se llama
// index.js no es necesario especificarlo en la ruta, como en este caso.
var middleware  = require("../middleware");

// ----- ROOT PATH -----
router.get("/", function(req, res){
  res.render("landing");
});

// ===============================
// AUTH ROUTES
// ===============================

// Show register form
router.get("/register", function(req, res) {
    res.render("register", {page: "register"});
});

// Handling user sign up
router.post("/register", function(req, res){
  
  var newUser = new User({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    avatar: req.body.avatar
  });
  
  if(req.body.adminCode === "secretcode123"){
    newUser.isAdmin = true;
  }
  
  User.register(newUser, req.body.password, function(err, user){
    if(err){
      console.log(err);
      return res.render("register", {error: err.message});
    } 
    passport.authenticate("local")(req, res, function(){
      req.flash("Success", "Welcome to YelpCamp " + user.username);
      res.redirect("/campgrounds");
    });
  });
  
});

// ===============================
// LOGIN ROUTES
// ===============================

// Render login form
router.get("/login", function(req, res) {
    res.render("login", {page: "login"});
});

// Login Logic
router.post("/login", passport.authenticate("local", {
  successRedirect: "/campgrounds",
  failureRedirect: "/login",
  failureFlash: true
}) ,function(req, res){
  
});

// Logout Logic
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged you out.");
    res.redirect("/campgrounds");
});

// ===============================
// USER PROFILE ROUTES
// ===============================

// ----- SHOW PATH -----
router.get("/users/:id", function(req, res){
  User.findById(req.params.id, function(err, foundUser){
    if(err){
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    }
    Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
    if(err){
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    }
    res.render("users/show", {user: foundUser, campgrounds: campgrounds});
    });
  }); 
});

module.exports = router;