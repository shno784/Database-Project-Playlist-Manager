//Function from https://stackoverflow.com/questions/20719550/play-one-html-audio-element-at-a-time Stack Overflow
function onlyPlayOneIn(container) {
  container.addEventListener(
    "play",
    function (event) {
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

function showplaylistBox(trackName, artistName) {
  const box = document.getElementById("playlistBox");
  box.style.display = "block";

  // Check and set the value only if the inputs exist
  document.querySelector('input[name="playlistsong_name"]').value = trackName;
  document.querySelector('input[name="playlistartist_name"]').value = artistName;
}

function closebox() {
  document.getElementById("playlistBox").style.display = "none";
}
