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

// Function to show the playlist box and populate track data
function showplaylistBox(trackName, artistName) {
  // Show the playlist box
  document.getElementById('playlistBox').style.display = 'block';

  // Loop through all playlist forms and populate hidden fields
  const playlistForms = document.querySelectorAll('.playlist-form');
  
  // For each playlist form, set the track data dynamically
  playlistForms.forEach(function(form) {
    // Find the playlist id from the form's ID (assuming button's text is the playlist name)
    const playlistId = form.querySelector('button').textContent;
    
    // Set the track's name and artist name for each playlist form
    document.getElementById('playlistsong_name_' + playlistId).value = trackName;
    document.getElementById('playlistartist_name_' + playlistId).value = artistName;
  });
}



function closebox() {
  document.getElementById("playlistBox").style.display = "none";
}
