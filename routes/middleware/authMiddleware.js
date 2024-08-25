const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { // Using Passport's `req.isAuthenticated()`
    console.log("User is authenticated, proceeding to the next middleware/route handler.");
    return next(); // User is authenticated, proceed to the next middleware/route handler
  } else {
    console.log("User is not authenticated, redirecting to login page.");
    res.redirect('/auth/login'); // User is not authenticated, redirect to login page
  }
};

module.exports = {
  isAuthenticated
};