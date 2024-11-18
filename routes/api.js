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
  const query = req.query.query; // Search query
  const filter = req.query.filter; // Filter (artist or song)
  const api_key = process.env.API_KEY;
  let sqlquery = "SELECT * FROM playlists where user_id = ?";
  let lastfmUrl = "";

  if (filter === "artist") {
    lastfmUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getTopTracks&artist=${encodeURIComponent(query)}&api_key=${api_key}&format=json`;
  } else if (filter === "song") {
    lastfmUrl = `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(query)}&api_key=${api_key}&format=json`;
  }

  request(lastfmUrl, function (err, response, body) {
    if (err) return next(err);
    const data = JSON.parse(body);
    let tracks = [];

    if (filter === "artist" && data.toptracks && data.toptracks.track) {
      tracks = data.toptracks.track.map((track) => ({
        name: track.name,
        artist: { name: track.artist.name },
      }));
    } else if (filter === "song" && data.results && data.results.trackmatches.track) {
      const trackMatches = data.results.trackmatches.track;
      tracks = trackMatches.map((track) => ({
        name: track.name,
        artist: { name: track.artist },
      }));
    }

    if (tracks.length === 0) {
      return db.query(sqlquery, [req.session.userId], (err, playlists) => {
        res.render("songs.ejs", { tracks: [], playlists });
      });
    }

    let completedRequests = 0;
    tracks.forEach((track) => {
      const trackName = track.name;
      const artistName = track.artist.name;
      const deezerUrl = `https://api.deezer.com/search?q=track:"${trackName}" artist:"${artistName}"`;

      request(deezerUrl, function (err, response, body) {
        completedRequests++;
        if (!err && response.statusCode === 200) {
          const deezerData = JSON.parse(body);
          if (deezerData.data && deezerData.data.length > 0) {
            const trackFound = deezerData.data.find((deezerTrack) => {
              return (
                deezerTrack.title.toLowerCase() === trackName.toLowerCase() &&
                deezerTrack.artist.name.toLowerCase() === artistName.toLowerCase()
              );
            });

            if (trackFound) {
              track.preview = trackFound.preview;
              track.albumCover = trackFound.album.cover_medium;
            }
          }
        }
        if (completedRequests === tracks.length) {
          db.query(sqlquery, [req.session.userId], (err, playlists) => {
            res.render("songs.ejs", { tracks, playlists });
          });
        }
      });
    });
  });
});

// Export the router object so index.js can access it
module.exports = router;
