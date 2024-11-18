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
router.get("/view/:id", (req, res, next) => {
  const playlistId = req.params.id;
  const userId = req.session.userId;
  let noSongs;

  // Query to get the playlist info and the songs in the playlist for the logged-in user
  const sqlquery = `
    SELECT p.id, p.name AS playlist_name, ps.song_name, ps.song_artist
    FROM playlists AS p
    LEFT JOIN playlist_songs AS ps ON p.id = ps.playlist_id
    WHERE p.user_id = ? AND p.id = ? AND ps.song_name IS NOT NULL
  `;

  db.query(sqlquery, [userId, playlistId], (err, playlist) => {
    if (err) {
      next(err);
    }
    // Check if there are no songs in the playlist
    if (playlist.length === 0) {
      noSongs = true;
      // Render the EJS template and pass the playlist data to it
      res.render("playlist_view", { playlist, noSongs });
    }
    // Render the EJS template and pass the playlist data to it
    res.render("playlist_view", { playlist, noSongs });
  });
});

//Show liked songs
router.get("/like_song", function (req, res, next) {
  const userId = req.session.userId;
  let sqlquery = "SELECT * FROM liked_songs WHERE user_id = ?";
  // Query to get liked songs
  db.query(sqlquery, [userId], (err, songs) => {
    if (err) {
      next(err);
      return;
    }
    // Render the EJS template and pass the liked songs data
    res.render("like_songs", { likedSongs: songs });
  });
});

//functionality for pressing like song button
router.post("/like_song", function (req, res, next) {
  const songName = req.body.song_name;
  const artistName = req.body.artist_name;

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
        message: "Song liked successfully!"
      });
    }
  });
});

router.get("/remove_liked_song/:id", function (req, res, next) {
  const songId = req.params.id;
  const userId = req.session.userId;
  let sqlquery = "DELETE FROM liked_songs WHERE id = ? AND user_id = ?";

  db.query(sqlquery, [songId, userId], (err, results) => {
    if (err) {
      next(err);
    } else {
      res.render("successLike", {
        message: "Song deleted successfully!"
      });
    }
  });
});

//Create new playlist
router.get("/create", function (req, res, next) {
  res.render("createPlaylist.ejs");
});

//create a playlist
router.post("/create", function (req, res, next) {
  const playlistName = req.body.name;
  const userId = req.session.userId;
  let checkquery = "SELECT * FROM playlists WHERE name = ? AND user_id = ?";
  let sqlquery = "INSERT INTO playlists (name, user_id) VALUES(?,?)";

  let playlistValues = [
    req.sanitize(playlistName),
    req.sanitize(userId),
  ];

  //check if there is already a playlist with the same name
  db.query(checkquery, playlistValues, (err, result) => {
    if (err){
      next(err)
    } else {
      if (result.length > 0) {
        // If a playlist with the same name exists, return an error message
        return res.render("successLike", {
          message: "A playlist with this name already exists. Please choose a different name."
        });
      }
      db.query(sqlquery, playlistValues, (err, result) => {
        if (err) {
          next(err);
        } else {
          res.render("successLike", {
            message: "Playlist Created Succesfully"
          });
        }
      });
    }
  })

});

//Add song to a playlist
router.post("/add_song/:id", function (req, res, next) {
  const playlistId = req.params.id;
  const songName = req.body.playlistsong_name;
  const artistName = req.body.playlistartist_name;
  let sqlquery =
    "INSERT INTO playlist_songs (playlist_id, song_name, song_artist) VALUES (?,?,?)";

  let song = [
    req.sanitize(playlistId),
    req.sanitize(songName),
    req.sanitize(artistName)
  ]
  db.query(sqlquery, song, (err, result) => {
    if (err) {
      next(err);
    } else {
      res.render("successLike", {
        message: "Added song to playlist successfully"
      });
    }
  });
});

//remove song from a playlist
router.get("/remove_song/:playlistId/:songname", function (req, res, next) {
  const playlistId = req.params.playlistId;
  const songname = req.params.songname;

  let sqlquery =
    "DELETE FROM playlist_songs WHERE playlist_id = ? AND song_name = ?";

  db.query(sqlquery, [playlistId, songname], (err, result) => {
    if (err) {
      next(err);
    } else {
      res.render("successLike", {
        message: "Song deleted successfully!"
      });
    }
  });
});

router.get("/delete/:id", function (req, res, next) {
  const playlistId = req.params.id;
  const userId = req.session.userId;

  sqlquery = "DELETE FROM playlists WHERE id = ? AND user_id = ?";

  db.query(sqlquery, [playlistId, userId], (err, results) => {
    if (err) {
      next(err);
    } else {
      res.render("successLike", {
        message: "Playlist deleted successfully!"
      });
    }
  });
});

module.exports = router;
