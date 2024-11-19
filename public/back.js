// Get the back button element
const backButton = document.getElementById("go-back-btn");
// Navigate back in the browser's history
backButton.addEventListener("click", function () {
  window.history.back();
});
