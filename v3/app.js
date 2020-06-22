var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  Campground = require("./models/campground"),
  seedDB = require("./seeds");

mongoose.connect("mongodb://localhost/yelp_camp_v3", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
seedDB();

app.get("/", function(req, res) {
  res.render("landing");
});

// INDEX(route) , shows all campgrounds

app.get("/campgrounds", function(req, res) {
  // getting campgrounds from db
  Campground.find({}, function(err, allCampgrounds) {
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds", { campgrounds: allCampgrounds });
    }
  });
  //  res.render("campgrounds", { campgrounds: campgrounds });
});

// CREATE(route) , posts or saves the new campground to the db

app.post("/campgrounds", function(req, res) {
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

app.get("/campgrounds/new", function(req, res) {
  res.render("new.ejs");
});

app.get("/campgrounds/:id", function(req, res) {
  // find the campground with provided id
  Campground.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundCampground) {
      if (err) {
        console.log(err);
      } else {
        console.log(foundCampground);

        // render show template with that campground
        res.render("show", { campground: foundCampground });
      }
    });
});

app.listen(3000, function() {
  console.log("YelpCamp server has started!");
});
