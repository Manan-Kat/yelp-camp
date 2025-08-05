const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
// importing models
const Campground = require("../models/campground");

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

const randomIndex = (arr) => arr[Math.floor(Math.random() * arr.length)];

// delete all entries in the collections
const seedDB = async () => {
  await Campground.deleteMany({});

  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const randomPrice = Math.floor(Math.random() * 30) + 10;
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${randomIndex(descriptors)} ${randomIndex(places)}`,
      image: "https://picsum.photos/1280/720",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis rerum ipsam illo ab numquam veniam ipsum nulla magni ea exercitationem esse accusantium perspiciatis distinctio deleniti voluptates laudantium, quas illum soluta.",
      price: randomPrice,
    });
    await camp.save();
  }
  console.log("Entries made succesfully!");
};
seedDB();
