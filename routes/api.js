const express = require("express");
const router = express.Router();
const redirectLogin = require("../middleware/redirectLogin");
const request = require("request");

//This will be used to add the api to search for songs, the regular will list maybe like 40 songs on the page then search functionality will be added.

router.get("/", function (req, res, next) {
  // Get page, offset, and limit from query
  const api_key = process.env.API_KEY;
  let sqlquery = "SELECT * FROM playlists where user_id = ?";
  const lastfmUrl = `https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=${api_key}&format=json`;

  request(lastfmUrl, function (err, response, body) {
    if (err) {
      next(err);
    } else {
      const data = JSON.parse(body);
      const tracks = data.tracks.track;
      let completedRequests = 0;

      //Iterate over tracks and get previews from Deezer
      tracks.forEach((track) => {
        const trackName = track.name;
        const artistName = track.artist.name;
        const deezerUrl = `https://api.deezer.com/search?q=track:"${trackName}" artist:"${artistName}"`;

        //Request for each preview from deezer
        request(deezerUrl, function (err, response, body) {
          completedRequests++;

          if (!err && response.statusCode === 200) {
            const deezerData = JSON.parse(body);
            //Get first match and append the url to lastfm object
            if (deezerData.data && deezerData.data.length > 0) {
              // Find the best match from the Deezer search results
              const trackFound = deezerData.data.find((deezerTrack) => {
                return (
                  deezerTrack.title.toLowerCase() === trackName.toLowerCase() &&
                  deezerTrack.artist.name.toLowerCase() ===
                    artistName.toLowerCase()
                );
              });

              if (trackFound) {
                //Append items to track object, return null if not found
                track.preview = trackFound.preview;
                track.albumCover = trackFound.album.cover_medium;
              } else {
                track.preview = null;
                track.albumCover = null;
              }
            } else {
              track.preview = null;
              track.albumCover = null;
            }
          } else {
            track.preview = null;
            track.albumCover = null;
          }
          //When requests are fulfilled for each track, render song.ejs
          if (completedRequests === tracks.length) {
            db.query(sqlquery, [req.session.userId], (err, playlists) => {
              res.render("songs.ejs", { tracks, playlists });
            })
            
          }
        });
      });
    }
  });
});

router.get("/search", function (req, res, next) {
  const query = req.query.query; // Search query (can be track or artist)
  const filter = req.query.filter; // The type of filter (can be artist or song)

  const api_key = process.env.API_KEY; // Your Last.fm API key
  let lastfmUrl = "";

  // Modify the URL based on the selected filter
  if (filter === "artist") {
    lastfmUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getTopTracks&artist=${query}&api_key=${api_key}&format=json`;
  } else if (filter === "song") {
    lastfmUrl = `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${query}&api_key=${api_key}&format=json`;
  }

  // Make a request to the Last.fm API
  request(lastfmUrl, function (err, response, body) {
    if (err) {
      next(err); // Handle error
    } else {
      const data = JSON.parse(body);
      let tracks = [];

      // Handle the response based on the type of search
      if (filter === "artist") {
        // Handle artist search - get the tracks of the artist
        tracks = data.toptracks.track.map((track) => ({
          name: track.name, // Track name
          artist: { name: track.artist.name }, // Same artist for all tracks
        }));
      } else if (filter === "song") {
        // Handle song (track) search - get the tracks
        const trackMatches = data.results.trackmatches.track;
        tracks = trackMatches.map((track) => ({
          name: track.name,
          artist: { name: track.artist },
        }));
      }

      // Now for each track, let's fetch the preview and album cover from Deezer
      let completedRequests = 0;

      tracks.forEach((track) => {
        const trackName = track.name;
        const artistName = track.artist.name;

        // Deezer API URL for track and artist search
        const deezerUrl = `https://api.deezer.com/search?q=track:"${trackName}" artist:"${artistName}"`;

        // Request to Deezer API to get track preview and album cover
        request(deezerUrl, function (err, response, body) {
          completedRequests++; // Increment when request is completed

          if (!err && response.statusCode === 200) {
            const deezerData = JSON.parse(body);

            // If Deezer returns results, find the track and append preview and album cover
            if (deezerData.data && deezerData.data.length > 0) {
              const trackFound = deezerData.data.find((deezerTrack) => {
                return (
                  deezerTrack.title.toLowerCase() === trackName.toLowerCase() &&
                  deezerTrack.artist.name.toLowerCase() ===
                    artistName.toLowerCase()
                );
              });

              if (trackFound) {
                track.preview = trackFound.preview;
                track.albumCover = trackFound.album.cover_medium;
              } else {
                track.preview = null;
                track.albumCover = null;
              }
            } else {
              track.preview = null;
              track.albumCover = null;
            }
          } else {
            track.preview = null;
            track.albumCover = null;
          }

          // Once all requests are completed, render the songs.ejs view
          if (completedRequests === tracks.length) {
            res.render("songs.ejs", { tracks });
          }
        });
      });
    }
  });
});


// Export the router object so index.js can access it
module.exports = router;
