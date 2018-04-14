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
// Estos dos componentes son necesarios para enviar emails.
var async       = require("async");
var crypto      = require("crypto");
// Configuracion de Sendgrid
const sgMail    = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


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
// RESET PASSWORD ROUTES
// ===============================

// ----- SHOW FORGOT PASSWORD FORM -----
router.get('/forgot', function(req, res) {
  res.render('forgot');
});

// ----- POST THE FORGOT PASSWORD FORM -----
router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      // Aqui creamos el token para enviar el correo.
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        // Aqui especificamos el tiempo que el token estara activo.
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      const msg = {
        to: user.email,
        from: 'andauquer-yelpcamp@noreply.com',
        subject: 'YelpCamp Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
              'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
              'http://' + req.headers.host + '/reset/' + token + '\n\n' +
              'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      sgMail.send(msg, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

// ----- SHOW THE RESET PASSWORD FORM -----
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

// ----- POST THE RESET PASSWORD FORM -----
router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      const msg = {
        to: user.email,
        from: 'andauquer-yelpcamp@noreply.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' + 
              'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      sgMail.send(msg, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/campgrounds');
  });
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