const express = require("express");
const router = express.Router();
const redirectLogin = require("../middleware/redirectLogin");
const request = require("request");

//Apply redirect login to all routes
router.use(redirectLogin);

router.get("/", function (req, res, next) {
  const api_key = process.env.API_KEY;
  const userId = req.session.userId;

  const sqlQuery = "SELECT * FROM playlists WHERE user_id = ?";
  const lastfmUrl = `https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=${api_key}&format=json`;

  // Fetch playlists
  db.query(sqlQuery, [userId], (err, playlists) => {
    if (err) {
      next (err)
    }
    // Fetch top tracks from Last.fm
    request(lastfmUrl, function (err, response, body) {
      if (err) {
        next(err)
      }

      let tracks;
      try {
        const data = JSON.parse(body);
        tracks = data.tracks.track;
      } catch (error) {
        return next(error);
      }

      if (!tracks || tracks.length === 0) {
        return res.render("songs.ejs", { tracks: [], playlists });
      }

      // Process each track to get Deezer data
      let completedRequests = 0;

      tracks.forEach((track) => {
        const trackName = encodeURIComponent(track.name);
        const artistName = encodeURIComponent(track.artist.name);
        const deezerUrl = `https://api.deezer.com/search?q=track:"${trackName}"artist:"${artistName}"`;

        request(deezerUrl, function (err, response, body) {
          completedRequests++;

          if (err || response.statusCode !== 200) {
            track.preview = null;
            track.albumCover = null;
          } else {
            try {
              const deezerData = JSON.parse(body);
              if (deezerData.data && deezerData.data.length > 0) {
                const match = deezerData.data.find((deezerTrack) => {
                  return (
                    deezerTrack.title.toLowerCase() === track.name.toLowerCase() &&
                    deezerTrack.artist.name.toLowerCase() ===
                      track.artist.name.toLowerCase()
                  );
                });

                if (match) {
                  track.preview = match.preview;
                  track.albumCover = match.album.cover_medium;
                } else {
                  track.preview = null;
                  track.albumCover = null;
                }
              } else {
                track.preview = null;
                track.albumCover = null;
              }
            } catch (deezerErr) {
              track.preview = null;
              track.albumCover = null;
            }
          }

          // Render the page when all requests are complete
          if (completedRequests === tracks.length) {
            res.render("songs.ejs", { tracks, playlists });
          }
        });
      });
    });
  });
});

router.get("/search", function (req, res, next) {
  const query = req.query.query;
  const filter = req.query.filter; // Filter (artist or song)
  const api_key = process.env.API_KEY;
  const userId = req.session.userId;

  const sqlQuery = "SELECT * FROM playlists WHERE user_id = ?";
  let lastfmUrl = "";

  // Construct Last.fm API URL based on filter
  if (filter === "artist") {
    lastfmUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getTopTracks&artist=${encodeURIComponent(query)}&api_key=${api_key}&format=json`;
  } else if (filter === "song") {
    lastfmUrl = `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(query)}&api_key=${api_key}&format=json`;
  } else {
    return next(err);
  }

  // Fetch data from Last.fm
  request(lastfmUrl, function (err, response, body) {
    if (err) return next(err);

    let tracks = [];
    try {
      const data = JSON.parse(body);

      // Depending on filter, process the response data
      if (filter === "artist" && data.toptracks && data.toptracks.track) {
        tracks = data.toptracks.track.map((track) => ({
          name: track.name,
          artist: { name: track.artist.name },
        }));
      } else if (filter === "song" && data.results &&  data.results.trackmatches &&data.results.trackmatches.track) {
        const trackMatches = data.results.trackmatches.track;
        tracks = trackMatches.map((track) => ({
        name: track.name,
        artist: { name: track.artist },
        }));
      }
    } catch (error) {
      return next(error);
    }

    // If no tracks found, render with empty results
    if (tracks.length === 0) {   
      return res.render("songs.ejs", { tracks, playlists: {} });
    }

    // Process tracks to fetch Deezer data
    let completedRequests = 0;
    tracks.forEach((track) => {
      const trackName = encodeURIComponent(track.name);
      const artistName = encodeURIComponent(track.artist.name);
      const deezerUrl = `https://api.deezer.com/search?q=track:"${trackName}"artist:"${artistName}"`;

      // Fetch Deezer data
      request(deezerUrl, function (err, response, body) {
        completedRequests++;

        if (!err && response.statusCode === 200) {
          try {
            const deezerData = JSON.parse(body);
            if (deezerData.data && deezerData.data.length > 0) {
              const trackFound = deezerData.data.find((deezerTrack) => {
                return (
                  deezerTrack.title.toLowerCase() === track.name.toLowerCase() &&
                  deezerTrack.artist.name.toLowerCase() === track.artist.name.toLowerCase());                      
              });

              if (trackFound) {
                track.preview = trackFound.preview;
                track.albumCover = trackFound.album.cover_medium;
              }
            }
          } catch (err) {
            return next(err)
          }
        }
        // Render the page when all requests are fulfilled
        if (completedRequests === tracks.length) {
          db.query(sqlQuery, [userId], (err, playlists) => {
            if (err) return next(err);
            res.render("songs.ejs", { tracks, playlists });
          });
        }
      });
    });
  });
});

// Export the router object so index.js can access it
module.exports = router;
