//Redirects user to login page if they're not logged in.
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("/users/login?error=You+need+to+log+in+first.");
  } else {
    next();
  }
};

module.exports = redirectLogin;
