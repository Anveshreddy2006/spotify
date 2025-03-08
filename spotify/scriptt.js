async function getSongs() {
    let response = await fetch("http://127.0.0.1:5500/spotify/songs/");
    let text = await response.text();

    let div = document.createElement("div");
    div.innerHTML = text;
    let links = div.getElementsByTagName("a");

    let songs = [];
    for (let link of links) {
        if (link.href.endsWith(".mp3")) {
            songs.push(decodeURIComponent(link.href.split('/').pop())); // Extract filename
        }
    }
    return songs;
}

async function main() {
    let songs = await getSongs();
    console.log(songs);

    let songUl = document.querySelector(".songList ul");
    if (!songUl) return;

    songUl.innerHTML = songs
        .map(song => `<li class="songItem" data-src="${song}">${song} <button class="playButton">▶</button></li>`)
        .join("");

    let audio = new Audio(); // Single audio instance
    let currentIndex = -1; // Track current song index
    let isPlaying = false; // Track if audio is playing

    function playSong(index) {
        if (index < 0 || index >= songs.length) return;
        currentIndex = index;
        let songSrc = `http://127.0.0.1:5500/spotify/songs/${songs[currentIndex]}`;
        audio.src = songSrc;
        audio.play();
        isPlaying = true;
        console.log(`Playing: ${songs[currentIndex]}`);

        // Highlight the playing song
        document.querySelectorAll(".songItem").forEach(el => el.style.fontWeight = "normal");
        document.querySelectorAll(".songItem")[currentIndex].style.fontWeight = "bold";

        // Update play/pause button
        document.querySelector(".playPauseButton img").src = "pause.svg";
    }

    function togglePlayPause() {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            document.querySelector(".playPauseButton img").src = "play.svg";
        } else if (currentIndex !== -1) {
            audio.play();
            isPlaying = true;
            document.querySelector(".playPauseButton img").src = "pause.svg";
        } else {
            playSong(0); // Start first song if nothing is playing
        }
    }

    document.querySelectorAll(".playButton").forEach((button, index) => {
        button.addEventListener("click", function () {
            if (currentIndex === index && isPlaying) {
                togglePlayPause();
            } else {
                playSong(index);
            }
        });
    });

    document.querySelector(".playPauseButton").addEventListener("click", togglePlayPause);

    document.querySelector(".prevButton").addEventListener("click", function () {
        if (currentIndex > 0) {
            playSong(currentIndex - 1);
        }
    });

    document.querySelector(".nextButton").addEventListener("click", function () {
        if (currentIndex < songs.length - 1) {
            playSong(currentIndex + 1);
        }
    });

    // Auto play next song when current song ends
    audio.addEventListener("ended", () => {
        if (currentIndex < songs.length - 1) {
            playSong(currentIndex + 1);
        }
    });
}

main();