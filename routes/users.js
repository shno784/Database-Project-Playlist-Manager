// Create a new router
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const redirectLogin = require("../middleware/redirectLogin");
const { body, validationResult } = require("express-validator");
const { validateRegistration } = require("../middleware/registervalidator");

router.get("/register", function (req, res, next) {
  res.render("register", { errors: [], data: {} });
});

router.post("/register", validateRegistration, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("register", {
      errors: errors.array(), // Pass errors to template
      data: req.body, // Pass form data back to populate form
    });
  } else {
    // saving data in database
    const saltRounds = 10;
    const plainPassword = req.body.password;
    //Store hashed password in database
    bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
      let sqlquery =
        "INSERT INTO users (username, firstname, lastname, email, hashedPassword) VALUES (?,?,?,?,?)";
      // execute sql query
      let newuser = [
        //sanitize inputs before putting them into database
        req.sanitize(req.body.username),
        req.sanitize(req.body.first),
        req.sanitize(req.body.last),
        req.sanitize(req.body.email),
        hashedPassword,
      ];
      db.query(sqlquery, newuser, (err, result) => {
        if (err) {
          next(err);
        } else
          result =
            "Hello " +
            req.sanitize(req.body.first) +
            " " +
            req.sanitize(req.body.last) +
            " you are now registered!  We will send an email to you at " +
            req.sanitize(req.body.email);
        result +=
          "Your password is: " +
          req.body.password +
          " and your hashed password is: " +
          hashedPassword;

        res.send(result);

        //Here, probably a successful login and then redirect to the login page so you have to make a hello and goodbye page lmao
      });
    });
  }
});


router.get("/login", function (req, res, next) {
  const errorMessage = req.query.error; // Get error from query parameters
  res.render("login.ejs", {message: {}, error: errorMessage, data: {}});
});

router.post("/login", function (req, res, next) {
  let sqlquery = "SELECT hashedpassword from users where username=(?)";
  const name = req.body.username;
  db.query(sqlquery, name, (err, result) => {
    if (err) {
      next(err);
    }
    if (result.length === 0) {
      return res.render("login", {message: {}, error: 'Incorrect username or password', data: req.body})
    } else {
      const hashedPassword = result[0].hashedpassword;
      bcrypt.compare(req.body.password, hashedPassword, function (err, result) {
        if (err) {
          next(err);
        } else if (result == true) {
          // Save user session here, when login is successful
          req.session.userId = name;
          //Adds a login flag to tell if the user is logged in
          req.session.isLoggedIn = true;
          res.render("login", {message: "Sucessfully logged in, redirecting..."})
        } else {
          // TODO: Send message
          return res.render("login", {message: {}, error: 'Incorrect username or password', data: req.body})
        }
      });
    }
  });
});

//Logout
router.get("/logout", redirectLogin, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("./");
    }
    res.render("logout", {message: 'Sucessfully logged out, redirecting...'});
  });
});

// Export the router object so index.js can access it
module.exports = router;
