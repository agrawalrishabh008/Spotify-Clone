console.log("Let's write Javascript")

let currentSong = new Audio;  //global variable.
// this has been made global so that only one song can be played at a time, and there are no multiple local copies playing at the same time.

let songs;
// this as been made global to control the next and previous songs

let currFolder;
// this is has been made global to implement the functionality of albums.

// this function coverts seconds to "seconds:minutes"
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// this function will take a folder name now and then further access the songs in that folder. this is done to execute the property of albums.
async function getSongs(folder){
    
    currFolder = folder;

    // fethcing songs from this local server, which is accessing the sonsg stored on our own system.
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    
    // now we are parsing the received information by fetch, to access the songs.
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
            // we are taking the part of the name after songs, because we do not want to show the other extra text.
        }
    }
    
    // adding the songs and showing them in the library section.
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    
    songUL.innerHTML = ""
    // we are making the song list blank every time when a different album is clicked, or else all the songs will get appended in the library.
    
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div> ${song.replaceAll("%20", " ")}
                </div>
                <div>Rishabh</div>
            </div>
            <div class="playnow">
                <span>Play Now
                </span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    }

    // "replace" is used to remove the %20 coming in the name of the song 

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {        
        e.addEventListener("click", element =>{
            
            // accessing the name of the song being clicked and playing it.
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            // "trim()" removes spaces. we used it here, because there was a space coming in the html because we had replaced "%20" from the song name to a space and when that song link was being passed to play, the wrong link was being passed. 

        })      
    })

    return songs
}

const playMusic = (track, pause=false)=>{
    currentSong.src = `/${currFolder}/` + track
    if(!pause){
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors)

    // traditional for loop is used instead of for-each beacuse, we want the work to be done asynchronously.
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
        if(e.href.includes("/songs")){
            let folder = e.href.split("/").slice(-2)[0]

            // get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json();

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}"  class="card">
                <div class="play">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#000" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round"/>
                    </svg>           
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`
        }
    }

    // Load the playlist and play first song, whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)

            // playing first song
            playMusic(songs[0])
        })
    })
    // if i used "target", then when i am clicking on img of the card, then the image properties are shown but when using "currentTarget", if i click enywhere on the card, the elemnt on which the eventListener is applied, that element's properties are shown.
    
}

async function main(){
    
    // get list of all songs
    await getSongs("songs/ncs")
    
    // this is done so that the first song of the library is already loaded when website is opened.
    playMusic(songs[0], true)

    // Display all the albums on the page
    displayAlbums()

    // Attach an event listener to play.
    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // listen for timeupdate event
    currentSong.addEventListener("timeupdate", ()=>{
        
        // updating the time as the song moves forward.
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`

        // seekbar movement code.  we are chnaging the css of the circle by changing its left value in percent.
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"

    })

    // add an eventlistener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
            
        // we are trying to bring the circle where we click
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100 ;
        document.querySelector(".circle").style.left = percent + "%"
        // "e.offsetX" gives us the X offset of our click position and "e.target.getBoundingClientRect().width" gives us the total X-width of the seekbar. then we convert that to % and add that to the circle.

        // changing the time of the song according to the circle.
        currentSong.currentTime = (currentSong.duration * percent)/100

    })

    // add an eventlistener for hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"
    })

    // add an eventlistener for close button
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    // add an event listener to previous.
    // we have given ids to these buttons so, we can directly access them.
    previous.addEventListener("click", ()=>{
        console.log("Previous clicked")
        
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        // here , we are accessing the songs array which stores the src of al the songs. now once we get the src, we just need the name part of the song, so we split the whole src on the base of "/" into an array and then take the last positon(name of song) and the index of that is stored in the variable "index" and then is used to control the next and previous buttons.

        if((index - 1)>=0){
            playMusic(songs[index-1])
        }
    })

    // add an event listener to next.
    next.addEventListener("click", ()=>{
        currentSong.pause()
        console.log("next clicked")
        
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        if((index+1)<songs.length){
            playMusic(songs[index+1])
        }
    })

    // add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", e=>{
        console.log("setting volume to", e.target.value ,"/ 100")

        currentSong.volume = parseInt(e.target.value)/100
    })

    // add eventlistener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            // strings are immutable, so we need to explicitly redefine them.

            currentSong.volume = 0;
            // updating songbar
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume = 0.1;
            
            // updating songbar
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })


}

main()
