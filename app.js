const express = require("express");
const path = require("path");
// method override to use put post delete requests
const methodOverride = require("method-override");
// RENDER ENGINE : we have used ejs as our render engine which has a big templating issue even though it has partials they are clunky to use so we will use ejs-mate for this so that its a bit easier
// it will help us to write reusable code for things like navbars by creating "Layouts"
const ejsMate = require("ejs-mate");

// Error handling wraper for async functions (again its stupid so if its too much use use good ol try-catches)
const handleAsyncFunction = require("./utils/HandleAsyncFunction");
const ExpressError = require("./utils/ExpressError");

const { campgroundSchema } = require("./joiSchemas/schemas");

// now that we have a defined schema lets make a middleware function that can be used anywhere we want
const validateCamoground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    console.log(msg);
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// importing models
const Campground = require("./models/campground");

const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => {
    console.log("Connected to MongoDB yelp-camp");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

mongoose.connection.on("error", (err) => {
  logError(err);
});

const app = express();

// EJS setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// NOTE: we do need to change the default behavior of body in request that is empty, we need to parse it
app.use(express.urlencoded({ extended: true }));

// setup method-override
app.use(methodOverride("_method"));

//APIs
// base route
app.get("/", (req, res) => {
  res.render("home");
});

// API to fetch all camgrounds
app.get(
  "/campgrounds",
  handleAsyncFunction(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

// Form to create a new campground
// IMPORTANT NOTE : Note that the /campgrounds/new needs to be defined before campgrounds/:id as "new" will be treated as an id if defined after which will throw an error
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

// API to create a new campground
app.post(
  "/campgrounds",
  validateCamoground,
  handleAsyncFunction(async (req, res, next) => {
    // for creating a new campground, we are so far only restricting the user from submitting on the frontend, but have put no checks here
    // so if someone hits the endpoint on postman they would be able to create a empty campground
    // we should make individual elements required on the schema, but can add a simple check here

    // if (!req.body.campground)
    //   throw new ExpressError("Campground data cannot be empty", 400);

    // NOTE:
    // added a middlware that uses joi which is a much more sofisticated approach compared to a manual approach

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// API to search one particular campground
app.get(
  "/campgrounds/:id",
  handleAsyncFunction(async (req, res) => {
    const foundCampground = await Campground.findById(req.params.id);
    res.render("campgrounds/show", { foundCampground });
  })
);

// Form to edit a campground
app.get(
  "/campgrounds/:id/edit",
  handleAsyncFunction(async (req, res) => {
    const foundCampground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { foundCampground });
  })
);

// API to edit existing campground
// Note that html does NOT support PUT requests, so we use method-override to override the method to PUT which we have to specify in the query with the string that we have specified in the method-override middleware initiation
app.put(
  "/campgrounds/:id",
  validateCamoground,
  handleAsyncFunction(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(
      id,
      req.body.campground
    );
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// Simple delete route, for now we are not checking wether its the author that is deleting the campground or not but will do that later
app.delete(
  "/campgrounds/:id",
  handleAsyncFunction(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

// 404 page
app.all(/(.*)/, (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Simple base error handling middleware
// But note that this will only catch the error when we pass the error in the next function in the various routes when handlinjg async errors
// In express we can create our own error classes and use them to handle errors in a way that is best suited for our app
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500);
  // template to display errors and the error stack a bit better and cleaner
  if (!err.message) err.message = "Oh crap, something went wrong!";
  if (!err.statusCode) err.statusCode = 500;
  res.render("error", { err });
});

app.listen(3000, () => {
  console.log("Serving the app on PORT 3000");
});
