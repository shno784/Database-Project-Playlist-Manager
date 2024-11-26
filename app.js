// Import express and ejs
var express = require("express");
var session = require("express-session");
const expressSanitizer = require("express-sanitizer");
require("dotenv").config();

// Import mysql module
var mysql = require("mysql2");

// Create the express application object
const app = express();
const port = 8000;

// Create a session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
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

// Set up public folder (for css and static js)
app.use(express.static(__dirname + "/public"));

// Use express sanitizer
app.use(expressSanitizer());

// Add database connection pool
const db = mysql.createPool({
  connectionLimit: 10, // Maximum number of connections in the pool
  host: "localhost",
  user: "playlist_manager_app",
  password: process.env.SQL_DB_PASSWORD,
  database: "playlist_manager",
});

// Function to verify database connection
const checkDatabaseConnection = (callback) => {
  db.query("SELECT 1", (err) => {
    if (err) {
      console.error("Database connection failed:", err);
      return callback(err);
    }
    console.log("Database connection successful");
    callback(null);
  });
};

// Keepalive mechanism to prevent idle timeout of database
setInterval(() => {
  db.query("SELECT 1", (err) => {
    if (err) {
      console.error("Keepalive failed:", err);
    } else {
      console.log("Keepalive successful");
    }
  });
}, 25200000); // Run every 7 hours

// Initialize the app and start the server
checkDatabaseConnection((err) => {
  if (err) {
    console.error("Failed to initialize the app. Exiting.");
    process.exit(1); // Exit if database connection fails
  }

  // Assign pool globally for use in routes
  global.db = db;

  // Define our application-specific data
  app.locals.siteData = { siteName: "Playlist Manager" };
  app.locals.basePath = "/usr/108";

  // Load the route handlers
  const mainRoutes = require("./routes/main");
  app.use("/", mainRoutes);

  const usersRoutes = require("./routes/users");
  app.use("/users", usersRoutes);

  const apiRoutes = require("./routes/api");
  app.use("/api", apiRoutes);

  const playlistRoutes = require("./routes/playlists");
  app.use("/playlists", playlistRoutes);

  // Start the web app listening
  app.listen(port, () => console.log(`Node app listening on port ${port}!`));
});
