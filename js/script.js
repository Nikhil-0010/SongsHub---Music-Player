let currentSong = new Audio();
let songs = [];
let currFolder;
let shuffleFlag = false;
let shuffledArray = [];
let loopEnabled = false;

// Convert time in displayable format  
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Fetch and display song albums
async function displayAlbums() {
    try {
        const response = await fetch('http://127.0.0.1:5500/songs/');
        const text = await response.text();
        const div = document.createElement("div");
        div.innerHTML = text;
        const anchors = Array.from(div.getElementsByTagName("a"));
        const cardContainer = document.querySelector(".cardContainer");
        
        for (const anchor of anchors) {
            if (anchor.href.includes("/songs/") && !anchor.href.includes(".htaccess")) {
                const folder = anchor.href.split("/").slice(-1)[0];
                const folderResponse = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
                const folderInfo = await folderResponse.json();
                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card rounded">
                        <div data-folder="${folder}" class="play flex justify-center align-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round"></path>
                            </svg>
                        </div>
                        <img class="rounded" src="/songs/${folder}/cover.jpeg" alt="" />
                        <h3>${folderInfo.title}</h3>
                        <p>${folderInfo.description}</p>
                        </div>`;
                    }
        }

        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("click", async (item) => {
                await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            });
        });

        document.querySelectorAll(".play").forEach(playButton => {
            playButton.addEventListener("click", async (item) => {
                document.querySelector(".playbar").style.display = "initial";
                await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                playMusic(decodeURI(songs[0]), false);
            });
        });
    } catch (error) {
        console.error("Error fetching albums:", error);
    }
}

// Fetch and display songs from albums
async function getSongs(folder) {
    try {
        currFolder = folder;
        const response = await fetch(`http://127.0.0.1:5500/${folder}/`);
        const text = await response.text();
        const div = document.createElement("div");
        div.innerHTML = text;
        const anchors = div.getElementsByTagName("a");
        songs = [];
        
        for (const anchor of anchors) {
            if (anchor.href.endsWith(".mp3")) {
                songs.push(anchor.href.split(`/${folder}/`)[1]);
            }
        }
        
        let inClass = document.body.classList.contains("util-light") ? "invert": "";
        const songUL = document.querySelector(".songList ul");
        songUL.innerHTML = songs.map(song => `
            <li>
                <img class="${inClass}" src="resources/svg/music.svg" alt="">
                <div class="info"><div>${song.replaceAll("%20", " ")}</div></div>
                <div class="playNow flex justify-center align-center ${inClass} "><img src="resources/svg/play.svg" alt=""></div>
            </li>
        `).join("");

        document.querySelectorAll(".songList li").forEach(e => {
            e.addEventListener('click', () => {
                document.querySelector(".playbar").style.display = "initial";
                playMusic(e.querySelector(".info").firstElementChild.innerHTML);
            });
        });
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}

// Play music
const playMusic = (track, pause = false) => {
    if (!pause) {
        currentSong.src = `/${currFolder}/` + track;
        currentSong.play();
    }
    play.src = "resources/svg/pause2.svg";
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// Utility function to get the current song index
const getCurrentSongIndex = (array) => array.indexOf(currentSong.src.split("/").pop());

// Utility function to get a random song index not in the shuffled array
const getRandomSongIndex = () => {
    let random;
    do {
        random = Math.floor(Math.random() * songs.length);
    } while (shuffledArray.includes(songs[random]));
    return random;
};

// Handle song playback
const handlePlay = (direction, array) => {
    let index = getCurrentSongIndex(array);
    if(loopEnabled) {
        playMusic(array[index]);
        loopEnabled =!loopEnabled;
        loop.classList.toggle("invert-green")
        return;
    }
    let newIndex = direction === "previous" ? index - 1 : index + 1;

    if (direction === "previous" && index > 0 || direction === "next" && array[newIndex] !== undefined) {
        playMusic(array[newIndex]);
    } else {
        index = getCurrentSongIndex(songs);
        let random = getRandomSongIndex();

        if (!shuffledArray.includes(songs[index])) {
            direction === "previous" ? shuffledArray.unshift(songs[index]) : shuffledArray.push(songs[index]);
        }
        playMusic(songs[random]);
        direction === "previous" ? shuffledArray.unshift(songs[random]) : shuffledArray.push(songs[random]);

        if (shuffledArray.length > 7) direction === "previous" ? shuffledArray.pop() : shuffledArray.shift();
    }
};

let day ="resources/svg/bulb-on-2.svg";
let night = "resources/svg/bulb-off-2.svg"
let currmode = night;
let container = document.querySelector(".container");
let left = container.firstElementChild;
let right = left.nextElementSibling;
let playbar = right.lastElementChild.lastElementChild;

// Day Night
const toggleDayNight = () =>{
    if(currmode == night){
        mode.src = day;
        currmode = day;
    }
    else{
        mode.src = night;
        currmode = night;
    }
    // container.style.backgroundColor = "white"
    // container.firstElementChild.firstElementChild.classList.toggle("invert");
    let imgs = [
        ...left.querySelectorAll("img"),
        ...right.firstElementChild.querySelectorAll("img"),
        ...right.firstElementChild.nextElementSibling.firstElementChild.querySelectorAll("img"),
        ...right.firstElementChild.querySelectorAll("button svg"),
        ...playbar.querySelectorAll(".songdata img")
    ];
    for(img of imgs){
        img.classList.toggle("invert");
    }
    document.body.classList.toggle("util-light");
    // document.body.classList.toggle("light");
}

// Main function to initialize event listeners and fetch albums
async function main() {
    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "resources/svg/pause2.svg";
        } else {
            currentSong.pause();
            play.src = "resources/svg/play.svg";
        }
    });

    window.addEventListener("keydown", e => {
        if (e.code === "Space") {
            if (currentSong.paused) {
                currentSong.play();
                play.src = "resources/svg/pause2.svg";
            } else {
                currentSong.pause();
                play.src = "resources/svg/play.svg";
            }
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = `${percent}%`;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    currentSong.addEventListener("ended", () => {
        play.src = "resources/svg/play.svg";
        if (shuffleFlag) {
            handlePlay("next", shuffledArray);
        } else {
            handlePlay("next", songs);
        }
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        if (shuffleFlag) {
            handlePlay("previous", shuffledArray);
        } else {
            handlePlay("previous", songs);
        }
    });

    next.addEventListener("click", () => {
        if (shuffleFlag) {
            handlePlay("next", shuffledArray);
        } else {
            handlePlay("next", songs);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = e.target.value / 100;
        document.querySelector(".volume img").src = e.target.value == 0 ? "resources/svg/mute.svg" : "resources/svg/volume.svg";
    });

    document.querySelector(".volume img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "resources/svg/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = "resources/svg/volume.svg";
            currentSong.volume = 0.2;
            document.querySelector(".range input").value = 20;
        }
    });

        shuffle.addEventListener("click", () => {
        shuffleFlag = !shuffleFlag;
        if (!shuffleFlag) {
            shuffledArray.length = 0;
        }
        shuffle.classList.toggle("invert-green");
    });

    loop.addEventListener("click", ()=>{
        loopEnabled = !loopEnabled;
        loop.classList.toggle("invert-green");
    })

    
    mode.addEventListener("click", ()=>{
        toggleDayNight()
    })
}

main();

