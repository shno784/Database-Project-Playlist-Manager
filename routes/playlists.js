const express = require("express");
const router = express.Router();


router.get("/", function (req, res, next) {
    res.render("playlists.ejs"); //placeholder
});
//This will be to add playlist functionality.

//we will have a playlist made for each user named liked songs then
// add playlist, delete playlist, you can click on the playlist and add songs. we will need a playlist schema, maybe a song one too
// playlists regular will list all playlists.








// Export the router object so index.js can access it
module.exports = router;