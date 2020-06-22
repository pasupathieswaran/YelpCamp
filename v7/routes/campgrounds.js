var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");

// INDEX(route) , shows all campgrounds

router.get("/", function(req, res) {
  // getting campgrounds from db
  Campground.find({}, function(err, allCampgrounds) {
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds/index", {
        campgrounds: allCampgrounds,
        currentUser: req.user
      });
    }
  });
  //  res.render("campgrounds", { campgrounds: campgrounds });
});

// CREATE(route) , posts or saves the new campground to the db

router.post("/", function(req, res) {
  var name = req.body.name;
  var image = req.body.image;
  var newCampground = { name: name, image: image };
  //create a new campground to db
  Campground.create(newCampground, function(err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/campgrounds");
    }
  });
  //campgrounds.push(newCampground);
  //res.redirect("/campgrounds");
});

//NEW SHOWS FORM TO CREATE NEW CAMP

router.get("/new", function(req, res) {
  res.render("campgrounds/new");
});
// show route
router.get("/:id", function(req, res) {
  // find the campground with provided id
  Campground.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundCampground) {
      if (err) {
        console.log(err);
      } else {
        //console.log(foundCampground);

        // render show template with that campground
        res.render("campgrounds/show", { campground: foundCampground });
      }
    });
});

module.exports = router;
