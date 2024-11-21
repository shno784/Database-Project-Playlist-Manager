// Get the back button element
const backButton = document.getElementById("go-back-btn");

// Listen for a click event on the back button
backButton.addEventListener("click", function () {
  const currentPath = window.location.pathname;

  // Exact path match for playlist.ejs
  if (currentPath === '/playlists') {
    window.location.href = '/'; // Redirect to the home page
  } 
  // Exact path match for songs.ejs
  else if (currentPath === '/songs') {
    window.location.href = '/'; // Redirect to the home page
  } 
  // Exact path match for playlist_view
  else if (currentPath === ('/createPlaylist')) {
    window.location.href = '/playlists'; // Redirect to the playlist page
  } 
  else {
    // For other pages, use history.back()
    window.history.back();
  }
});
