// Create a new router
const express = require("express");
const router = express.Router();
//const redirectLogin = require('../middleware/redirectLogin')

// Handle our routes
router.get("/", function (req, res, next) {
    res.render("index.ejs", { isLoggedIn: req.session.isLoggedIn }); //placeholder
});

router.get("/about", function (req, res, next) {
    res.render("about.ejs");
  });


// Export the router object so index.js can access it
module.exports = router;