//Function from https://stackoverflow.com/questions/20719550/play-one-html-audio-element-at-a-time Stack Overflow
function onlyPlayOneIn(container) {
  container.addEventListener(
    "play",
    (event) => {
      audio_elements = container.getElementsByTagName("audio");
      for (i = 0; i < audio_elements.length; i++) {
        audio_element = audio_elements[i];
        if (audio_element !== event.target) {
          audio_element.pause();
        }
      }
    },
    true
  );
}

document.addEventListener("DOMContentLoaded", function () {
  onlyPlayOneIn(document.body);
});

// Function to show the playlist box and save song in playlist
function showplaylistBox(trackName, artistName) {
  // Show the playlist box
  document.getElementById("playlistBox").style.display = "block";
  // Loop through all playlist forms and populate hidden fields
  const playlistForms = document.querySelectorAll(".playlist-form");

  playlistForms.forEach((form) => {
    form.querySelector("input#playlistsong_name").value = trackName;
    form.querySelector("input#playlistartist_name").value = artistName;
  });
}

function closebox() {
  document.getElementById("playlistBox").style.display = "none";
}
