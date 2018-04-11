var express       = require("express");
// Esta linea de codigo es necesaria para nuestros archivos de rutas.
// Ver Seccion 34, clase 308 alrededor de la mitad del video para recordar
// el porque de usar mergeParams: ture
var router        =  express.Router({mergeParams: true});
var Campground    = require("../models/campground");
var Comment       = require("../models/comment");
// La razon por la cual no especificamos el nombre del archivo (index.js) es
// porque cuando nosotros hacemos un require de un archivo, si este se llama
// index.js no es necesario especificarlo en la ruta, como en este caso.
var middleware    = require("../middleware");

// ================================
// COMMENTS ROUTES
// ================================

// ----- NEW PATH -----
router.get("/new", middleware.isLoggedIn, function(req, res){
  Campground.findById(req.params.id, function(err, campground){
    if(err){
      console.log(err);
    } else {
      res.render("comments/new", {campground: campground});
    }
  });
});

// ----- CREATE PATH -----
router.post("/", middleware.isLoggedIn, function(req, res){
  Campground.findById(req.params.id, function(err, campground) {
    if(err){
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      Comment.create(req.body.comment, function(err, comment){
        if(err){
          req.flash("error", "Something went wrong.");
          res.redirect('/campgrounds/' + campground._id);
          console.log(err);
        } else {
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          campground.comments.push(comment);
          campground.save();
          req.flash("success", "Successfully added comment.");
          res.redirect('/campgrounds/' + campground._id);
        }
      });
    }
  });
});

// ----- EDIT PATH -----
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
  Campground.findById(req.params.id, function(err, foundCampground) {
    if(err || !foundCampground){
      req.flash("error", "Campground not found.");
      return res.redirect("back");
    }
    Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
        res.redirect("back");
      } else {
        res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
      }
    });
  });
});

// ----- UPDATE PATH -----
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
    if(err){
      res.redirect("back");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

// ----- DESTROY PATH -----
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
  Comment.findByIdAndRemove(req.params.comment_id, function(err){
    if(err){
      res.redirect("back");
    } else {
      req.flash("success", "Comment deleted.");
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});



module.exports = router;