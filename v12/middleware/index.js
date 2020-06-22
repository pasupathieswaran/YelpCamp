// all middleware goes here
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middlewareObj = {};
//
middlewareObj.checkCampgroundOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    // is logged in ,  if not redirect to back -- (look at final else)
    Campground.findById(req.params.id, function(err, foundCampground) {
      if (err) {
        req.flash("error", "Campground not found");
        res.redirect("back");
      } else {
        // does the user owns the campground?
        if (foundCampground.author.id.equals(req.user._id)) {
          // cannot use triple equals or double equals because, .equals is built in mongoose object (req.user._id is a string, foundCampground is mongoose object)
          next();
        } else {
          req.flash("error", "You don't have permission to do that!");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("back");
  }
};
//
middlewareObj.checkCommentOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    // is logged in ,  if not redirect to back -- (look at final else)
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if (err) {
        res.redirect("back");
      } else {
        // does the user owns the comment?
        if (foundComment.author.id.equals(req.user._id)) {
          // cannot use triple equals or double equals because, .equals is built in mongoose object (req.user._id is a string, foundComment is mongoose object)
          next();
        } else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};
//
middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be Logged in to do that!");
  res.redirect("/login");
};
//
module.exports = middlewareObj;
