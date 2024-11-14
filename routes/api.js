const express = require("express");
const router = express.Router();
const redirectLogin = require("../middleware/redirectLogin");
const request = require("request");

//This will be used to add the api to search for songs, the regular will list maybe like 40 songs on the page then search functionality will be added.

router.get("/", function (req, res, next) {
  // Get page, offset, and limit from query
  const api_key = "858b19bec0a85e46c4e8cc260545295a";

  const url = `https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=${api_key}&format=json`;

  request(url, function (err, response, body) {
    if (err) {
      next(err);
    } else {
      const data = JSON.parse(body);
      const tracks = data.tracks.track;

      res.render("songs.ejs", { tracks });
    }
  });
});

router.get("/search", function (req, res, next) {
  const query = req.query.query;
  const api_key = "858b19bec0a85e46c4e8cc260545295a";
  const url = `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${query}&api_key=${api_key}&format=json`;

  request(url, function (err, response, body) {
    if (err) {
      next(err);
    } else {
      const data = JSON.parse(body);
      const track = data.results.trackmatches.track;
      const tracks = track.map((track) => ({
        name: track.name,
        artist: track,
        url: track.url,
        listeners: track.listeners // Add this if available in the API response
      }));

      console.log(tracks);

      res.render("songs.ejs", { tracks });
    }
  });
});

// Export the router object so index.js can access it
module.exports = router;
