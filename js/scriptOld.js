let currentSong = new Audio();
let songs;
let currFolder;
let shuffleFlag = false;
let shuffledArray = [];


// Convert time in displayable format  
function secondsToMinutesSeconds(seconds) {
    if(isNaN(seconds) || seconds < 0){
        return "00:00";
    }

    // Calculate minutes and remaining seconds
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);

    // Format minutes and seconds as two digits
    var formattedMinutes = String(minutes).padStart(2, '0');
    var formattedSeconds = String(remainingSeconds).padStart(2, '0');
    
    // Concatenate minutes and seconds with an asterisk in between
    return formattedMinutes + ':' + formattedSeconds;
}

// fetch and display song albums
async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    // console.log(anchors)
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        // console.log(e.href);
        if(e.href.includes("/songs/") && !e.href.includes(".htaccess")){
            let folder = e.href.split("/").slice(-1)[0];
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let folderInfo = await a.json();
            // console.log(folderInfo);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card rounded">
            <div data-folder="${folder}" class="play flex justify-center align-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 20V4L19 12L5 20Z"
                  stroke="#141B34"
                  fill="#000"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </div>
            <img
              class="rounded"
              src="/songs/${folder}/cover.jpeg"
              alt=""
            />
            <h3>${folderInfo.title}</h3>
            <p>${folderInfo.description}</p>
          </div>`

        }
    }

    // Load the playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            // console.log(item.target, item.target.dataset)
            // songs = await getSongs(`songs/${item.target.dataset}`);
            // console.log(item.currentTarget, item.currentTarget.dataset)
            await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            // playMusic(decodeURI(songs[0], true));
        })
    })

    // Event listener to card play button
    Array.from(document.getElementsByClassName("play")).forEach(e=>{
        e.addEventListener("click", async item=>{
            document.querySelector(".playbar").style.display = "initial"
            await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            // console.log(songs[0]);
            playMusic(decodeURI(songs[0]), false);
        })
    })
}

// fetch & display songs from albums
async function getSongs(folder){
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1]); // split func. split string in 2 array [1] is second array.
        }
        
    }
    
    // Shows all songs in playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    //songUl is an array so to select its 1st element we used [0] at end.
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML +=`
        <li>
            <img class="invert" src="resources/svg/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20"," ")}</div>
            </div>
            <div class="playNow flex justify-center align-center">
                <img class="invert" src="resources/svg/play.svg" alt="">       
            </div>
                        
        </li>
          `;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e =>{
        e.addEventListener('click', ()=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            document.querySelector(".playbar").style.display = "initial"
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        });
    })
}

// plays music
const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track);
    // console.log(audio);
    // {
    //     let random = Math.floor(Math.random()*songs.length);
    //     track = decodeURI(songs[random]);
    //     // if(shuffledArray.includes(track)){
    //     //     console.log("includes")
    //     // }
    //     // shuffledArray.push(track);
    // }
    console.log(shuffledArray);
    if(!pause){
        currentSong.src  = `/${currFolder}/` + track;
        currentSong.play();
    }
    play.src = "resources/svg/pause2.svg";
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00" ;
}


// Utility function to get the current song index
const getCurrentSongIndex = (array) => array.indexOf(currentSong.src.split("/").slice(-1)[0]);

// Utility function to get a random song index not in the shuffled array
const getRandomSongIndex = () => {
let random;
do {
    random = Math.floor(Math.random() * songs.length);
} while (shuffledArray.includes(songs[random]));
return random;
};

// Function to handle song playback in shuffle mode
const handleShufflePlay = (direction) => {
let index = getCurrentSongIndex(shuffledArray);
if ((direction === "previous" && index - 1 >= 0) || (direction === "next" && shuffledArray[index + 1] !== undefined)) {
    playMusic(shuffledArray[direction === "previous" ? index - 1 : index + 1]);
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

// Function to handle song playback in normal mode
const handleNormalPlay = (direction) => {
let index = getCurrentSongIndex(songs);
if ((direction === "previous" && index - 1 >= 0) || (direction === "next" && index + 1 < songs.length)) {
    playMusic(songs[direction === "previous" ? index - 1 : index + 1]);
}
};
async function main(){

    // Get the lists of all the songs
    // await getSongs("songs/Old_Melody");
    // console.log(songs);
    // playMusic(songs[0], true);

    // Display all the albums
    displayAlbums();
    
    // // Play the first song
    // var audio = new Audio(songs[0]);
    // audio.play();

    // audio.addEventListener("loadeddata",()=>{
    //     let duration = audio.duration;
    //     console.log(duration);
    // })
    // console.log(audio.duration);

    // Attach an event listener to play, pause
    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play();
            play.src = "resources/svg/pause2.svg";
        }
        else{
            currentSong.pause();
            play.src = "resources/svg/play.svg";
        }
    })
    // Event listener for spacebar
    window.addEventListener("keydown", e=>{
        if(e.code == "Space"){
            if(currentSong.paused){
                currentSong.play();
                play.src = "resources/svg/pause2.svg";
            }
            else{
                currentSong.pause();
                play.src = "resources/svg/play.svg";
            } 
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", ()=>{
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration)* 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e =>{
        // console.log(e.target.getBoundingClientRect().width, e.offsetX, e.offsetY);
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    })

    // automatically plays next song from playlist when finished
    currentSong.addEventListener("ended", ()=>{
        play.src = "resources/svg/play.svg";
        let index = getCurrentSongIndex(songs);
        if(shuffleFlag){ 
            index = getCurrentSongIndex(shuffledArray);
                console.log("a")
                handleShufflePlay("next");
        }
        else{
            handleNormalPlay("next");
        }
        // if((index+1) < songs.length){
        //     playMusic(songs[index+1]);
        // }
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = 0;
        // document.querySelector(".hamburger").style.display = "none";
    })

    // Add an event listener for closing hamburger
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%";
        // document.querySelector(".hamburger").style.display = "initial";
    })


    // Add event listeners to previous and next buttons
    previous.addEventListener("click", () => {
        if (shuffleFlag) {
            handleShufflePlay("previous");
        } else {
            handleNormalPlay("previous");
        }
    });

    next.addEventListener("click", () => {
        if (shuffleFlag) {
            handleShufflePlay("next");
        } else {
            handleNormalPlay("next");
        }
    });


    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        console.log("Setting volume to, " +  e.target.value);
        currentSong.volume = e.target.value/100;
        let volIcon = document.querySelector(".volume img");
        if(e.target.value == 0){
            volIcon.src = volIcon.src.replace("volume.svg", "mute.svg");
        }
        else{
            volIcon.src = volIcon.src.replace("mute.svg", "volume.svg");
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume img").addEventListener("click", e=>{
        // console.log(e.target.src);
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg");
            currentSong.volume = 0.2;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20;
        }
    })

    // Shuffles the songs
    shuffle.addEventListener("click", e=>{
        if(shuffleFlag == false) shuffleFlag = true;
        else {
            shuffleFlag = false;
            shuffledArray.length = 0;
        }
        shuffle.classList.toggle("invert-green");
    })

}

main();