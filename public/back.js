// Get the back button element
const backButton = document.getElementById("go-back-btn");

// Navigate back in the browser's history or force redirect
backButton.addEventListener("click", function () {
  const currentPath = window.location.pathname;

  // If you're on the playlists or songs page, or the create page, force a redirect
  if (currentPath.startsWith('/usr/108/playlists') || currentPath.startsWith('/usr/108/songs')) {
      window.location.replace('./');
  } else {
    // Otherwise, use history.back() to go back
    window.history.back();
  }
});
