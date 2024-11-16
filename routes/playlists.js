const express = require("express");
const router = express.Router();
const redirectLogin = require("../middleware/redirectLogin");
const request = require("request");

router.get("/", function (req, res, next) {
  // Query to get playlists
  db.query(
    "SELECT * FROM playlists WHERE user_id = ?",
    [req.session.userId],
    (err, playlists) => {
      if (err) {
        next(err);
        return;
      }
      // Render the EJS file and pass the playlists data
      res.render("playlists", { playlists: playlists });
    }
  );
});

//Show songs for each playlist
router.get('/view/:id', (req, res, next) => {
    const playlistId = req.params.id;
    const userId = req.session.userId; // Assuming user ID is stored in session
  
    // Query to get the playlist info and the songs in the playlist for the logged-in user
    const sqlQuery = `
    SELECT p.name AS playlist_name, ps.song_name, ps.song_artist
    FROM playlists p
    LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
    WHERE p.user_id = ? AND p.id = ?
  `;
    
    db.query(sqlQuery, [playlistId, userId], (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.length === 0) {
        // Handle this case, e.g., by sending an error or a message
        return res.send('Error: Playlist not found or no songs in playlist');
      }
      // Separate playlist data and songs data
  const playlist = {
    name: results[0].playlist_name, // Playlist name
    songs: results.map(row => ({
      song_name: row.song_name,
      artist: row.artist
    })) // Songs in the playlist
  };

  // Check if there are no songs in the playlist
  const noSongs = playlist.songs.length === 0;

  // Render the EJS template and pass the playlist data to it
  res.render('playlist_view', { playlist, noSongs });
    });
  });
  
//Show liked songs
router.get("/like_song", function (req, res, next) {
  // Query to get liked songs
  db.query(
    "SELECT * FROM liked_songs WHERE user_id = ?",
    [req.session.userId],
    (err, likedSongs) => {
      if (err) {
        next(err)
        return;
      }
      console.log(likedSongs)
      // Render the EJS template and pass the liked songs data
    res.render("like_songs", { likedSongs: likedSongs });
    }
  );
});

//functionality for pressing like song button
router.post("/like_song", function (req, res, next) {
  const songName = req.body.song_name;
  const artistName = req.body.artist_name;
  console.log(songName);
  let sqlquery =
    "INSERT INTO liked_songs(user_id ,name, artist) VALUES (?,?,?)";

  let liked_song = [
    //sanitize inputs before putting them into database
    req.sanitize(req.session.userId),
    req.sanitize(songName),
    req.sanitize(artistName),
  ];
  db.query(sqlquery, liked_song, (err, result) => {
    if (err) {
      next(err);
    } else {
      res.render("successLike", {
        message: "Song liked successfully!", // Pass the success message to the template
      });
    }
  });
});

//Create new playlist
router.get("/create", function (req, res, next) {
    res.render("createPlaylist.ejs")
})

router.post("/create", function (req, res, next) {
    const playlistName = req.body.name
    let sqlquery = "INSERT INTO playlists (name, user_id) VALUES(?,?)"

    let playlistValues = [
        req.sanitize(playlistName),
        req.sanitize(req.session.userId)
    ]

    db.query(sqlquery, playlistValues, (err, result) => { 
        if (err) {
            next(err);
          } else
          {
            res.render("successLike", {
                message: "Playlist Created Succesfully", // Pass the success message to the template
              });
          }
    })
})


//This will be to add playlist functionality.

//Call liked songs and playlist, table showing title saying liked songs and a button to open, playlist has name and they have a delete button and open

//Create playlist

//Delete playlist

// Export the router object so index.js can access it
module.exports = router;
