//Redirects user to login page if they're not logged in.
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        // res.render('login.ejs', {message: {}, error: "You need to log in first."}); 
        res.redirect('../users/login?error=You+need+to+log+in+first.');
    } else {
      next(); 
    }
  };
//This will be msg the actual login will be message.
  module.exports = redirectLogin;