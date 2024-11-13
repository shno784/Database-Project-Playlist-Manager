const express = require("express");
const router = express.Router();
const redirectLogin = require('../middleware/redirectLogin')


//This will be used to add the api to search for songs, the regular will list maybe like 40 songs on the page then search functionality will be added.

router.get("/", redirectLogin, function (req, res, next) {
    res.render("songs.ejs"); //placeholder
});







// Export the router object so index.js can access it
module.exports = router;