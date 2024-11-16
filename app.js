// Import express and ejs
var express = require("express");
var ejs = require("ejs");
var session = require("express-session");
var validator = require("express-validator");
const expressSanitizer = require("express-sanitizer");
require('dotenv').config();

//Import mysql module
var mysql = require("mysql2");

// Create the express application object
const app = express();
const port = 8000;

// Create a session
app.use(
    session({
      secret: "secretwordddd",
      resave: false,
      saveUninitialized: false,
      cookie: {
        expires: 600000,
      },
    })
  );

// Tell Express that we want to use EJS as the templating engine
app.set("view engine", "ejs");

// Set up the body parser
app.use(express.urlencoded({ extended: true }));

// Set up public folder (for css and statis js)
app.use(express.static(__dirname + "/public"));

//Use express sanitizer
app.use(expressSanitizer());

//Add db stuff
const db = mysql.createConnection({
    host: "localhost",
    user: "playlist_manager_app",
    password: "qwertyuiop",
    database: "playlist_manager",
  });
// Connect to the database
db.connect((err) => {
    if (err) {
      throw err;
    }
    console.log("Connected to database");
  });
  global.db = db;

// Define our application-specific data
app.locals.siteData = { siteName: "Playlist Manager" };
// Load the route handlers
const mainRoutes = require("./routes/main");
app.use("/", mainRoutes);

const usersRoutes = require("./routes/users");
app.use("/users", usersRoutes);

const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes)

const playlistRoutes = require("./routes/playlists");
app.use("/playlists", playlistRoutes)
// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port ${port}!`));