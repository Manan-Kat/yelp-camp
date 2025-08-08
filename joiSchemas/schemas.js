// joi: its a schema validation library that can be used to validate the data that we are getting from the form on our frontend
// even though we are stopping the user for submitting to the server on the frontend, we dont have any validation or checks for the data in the actual api
// so any user can hit the api and create epmty campgrounds or with invalid data, this is where we use joi
// NOTE that this is not a mongoose schema at all, this is basically a well defined system to check if the object meets our requirements
const Joi = require("joi");
// lets create a basic campground object schema that we are basically using everywhere. we will define its structure once and use that definition again and again
// the best part is that we can change this structure directly from here and it would be applied everywhere rather than having to change it in every single route
module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    description: Joi.string().required(),
  }).required(),
}).required();
// now we can impor this schema anywhere and use it there to validate the json structure that we get in the api call
// it can also be fined tuned to a much larger degree using the joi api
 