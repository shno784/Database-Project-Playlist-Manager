const express = require("express");
const router = express.Router();
const redirectLogin = require("../middleware/redirectLogin");

//Apply redirect login to all routes
router.use(redirectLogin);

router.get("/", function (req, res, next) {
  // Get all playlists for logged in user
  db.query(
    "SELECT * FROM playlists WHERE user_id = ?",
    [req.session.userId],
    (err, playlists) => {
      if (err) {
        return next(err);
      }
      res.render("playlists", { playlists: playlists });
    }
  );
});

router.get("/search", function (req, res, next) {
  const query = req.query.search_playlist;
  let sqlquery = "SELECT * FROM playlists WHERE name LIKE '%" + query + "%'";

  db.query(sqlquery, (err, result) => {
    if (err) {
      return next(err);
    }
    res.render("playlist_search", {playlists: result});
  })
})

//Show songs for each playlist
router.get("/view/:id", (req, res, next) => {
  const playlistId = req.params.id;
  const userId = req.session.userId;
  let noSongs;

  //Get the playlist and the songs in the playlist for the logged-in user
  const sqlquery = `
    SELECT p.id, p.name AS playlist_name, ps.song_name, ps.song_artist
    FROM playlists AS p
    LEFT JOIN playlist_songs AS ps ON p.id = ps.playlist_id
    WHERE p.user_id = ? AND p.id = ? AND ps.song_name IS NOT NULL
  `;

  db.query(sqlquery, [userId, playlistId], (err, playlist) => {
    if (err) {
      return next(err);
    }
    // Check if there are no songs in the playlist
    if (playlist.length === 0) {
      noSongs = true;
      res.render("playlist_view", { playlist, noSongs });
    }
    res.render("playlist_view", { playlist, noSongs });
  });
});

//Show liked songs
router.get("/like_song", function (req, res, next) {
  const userId = req.session.userId;
  let sqlquery = "SELECT * FROM liked_songs WHERE user_id = ?";

  db.query(sqlquery, [userId], (err, songs) => {
    if (err) {
      return next(err);
    }

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
      return next(err);
    }
    res.render("successLike", {
      message: "Song liked successfully!",
      previousUrl: './like_song' || '/'
    });
  });
});
//Remove the songs from liked table
router.get("/remove_liked_song/:id", function (req, res, next) {
  const songId = req.params.id;
  const userId = req.session.userId;
  let sqlquery = "DELETE FROM liked_songs WHERE id = ? AND user_id = ?";

  db.query(sqlquery, [songId, userId], (err, results) => {
    if (err) {
      return next(err);
    } else {
      res.render("successLike", {
        message: "Song unliked successfully!"
      });
    }
  });
});

//Get playlist page
router.get("/create", function (req, res, next) {
  res.render("createPlaylist.ejs");
});

//create a playlist
router.post("/create", function (req, res, next) {
  const playlistName = req.body.name;
  const userId = req.session.userId;
  let checkquery = "SELECT * FROM playlists WHERE name = ? AND user_id = ?";
  let sqlquery = "INSERT INTO playlists (name, user_id) VALUES(?,?)";

  let playlistValues = [req.sanitize(playlistName), req.sanitize(userId)];

  //check if there is already a playlist with the same name
  db.query(checkquery, playlistValues, (err, result) => {
    if (err) {
      return next(err);
    }
    if (result.length > 0) {
      // If a playlist with the same name exists, return an error message
      return res.render("successLike", {
        message:
          "A playlist with this name already exists. Please choose a different name."
      });
    }
    db.query(sqlquery, playlistValues, (err, result) => {
      if (err) {
        return next(err);
      }
      res.render("successLike", {
        message: "Playlist Created Succesfully!"
      });
    });
  });
});

//Add song to a playlist
router.post("/add_song/:id", function (req, res, next) {
  const playlistId = req.params.id;
  const songName = req.body.playlistsong_name;
  const artistName = req.body.playlistartist_name;

  let checkquery = "SELECT * FROM playlist_songs WHERE playlist_id = ? AND song_name = ? AND song_artist = ?";
  let sqlquery =
    "INSERT INTO playlist_songs (playlist_id, song_name, song_artist) VALUES (?,?,?)";

  let song = [
    req.sanitize(playlistId),
    req.sanitize(songName),
    req.sanitize(artistName),
  ];
  db.query(checkquery, song, (err, songs) => {
    if (err) {
      return next(err);
    }
    if (songs.length > 0) {
      return res.render("successLike", {
        message: "You already liked this song."
      });
    }
    db.query(sqlquery, song, (err, result) => {
      if (err) {
        return next(err);
      }
      return res.render("successLike", {
        message: "Added song to playlist successfully!"
      });
    });
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
      return next(err);
    } else {
      res.render("successLike", {
        message: "Song removed successfully!"
      });
    }
  });
});

//Delete a playlist
router.get("/delete/:id", function (req, res, next) {
  const playlistId = req.params.id;
  const userId = req.session.userId;

  sqlquery = "DELETE FROM playlists WHERE id = ? AND user_id = ?";
  //Query the database to delete the playlist
  db.query(sqlquery, [playlistId, userId], (err, results) => {
    if (err) {
      return next(err);
    } else {
      res.render("successLike", {
        message: "Playlist deleted successfully!"
      });
    }
  });
});

module.exports = router;
