var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  Campground = require("./models/campground"),
  Comment = require("./models/comment"),
  User = require("./models/user"),
  seedDB = require("./seeds");

mongoose.connect("mongodb://localhost/yelp_camp_v6", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
seedDB();

// passport configuration

app.use(
  require("express-session")({
    secret: "NamaSivaya",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// putting currentUser in all the routes
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next(); /// next is very important , it will be the route handler in most cases
});

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
      res.render("campgrounds/index", {
        campgrounds: allCampgrounds,
        currentUser: req.user
      });
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
  res.render("campgrounds/new");
});

app.get("/campgrounds/:id", function(req, res) {
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

/// comments route
app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res) {
  // find campground by id
  Campground.findById(req.params.id, function(err, campground) {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", { campground: campground });
    }
  });
});

app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res) {
  // look for campgound  using id
  Campground.findById(req.params.id, function(err, campground) {
    if (err) {
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      // create new comment
      Comment.create(req.body.comment, function(err, comment) {
        if (err) {
          console.log(err);
        } else {
          // connect new comment to campground
          campground.comments.push(comment);
          campground.save();
          // redirect campground show page

          res.redirect("/campgrounds/" + campground._id);
        }
      });
    }
  });
});
//=====================
// Auth routes
//===========
// show register form
app.get("/register", function(req, res) {
  res.render("register");
});
// sign up logic

app.post("/register", function(req, res) {
  var newUser = new User({ username: req.body.username });
  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      return res.render("register");
    }
    passport.authenticate("local")(req, res, function() {
      res.redirect("/campgrounds");
    });
  });
});
/// show login form
app.get("/login", function(req, res) {
  res.render("login");
});
// login logic
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
  }),
  function(req, res) {}
);
//// logic route
app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
////
app.listen(3000, function() {
  console.log("YelpCamp server has started!");
});
