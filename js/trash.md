// Add an event listener to previous and next
    previous.addEventListener("click", ()=>{
        if(shuffleFlag == true){
            let index = shuffledArray.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if((index-1) >= 0){
                // console.log("pa");
                playMusic(shuffledArray[index-1]);
            }
            else{
                index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
                let random = Math.floor(Math.random()*songs.length);
                if(!shuffledArray.includes(songs[index])){
                    console.log("previf");
                    shuffledArray.unshift(songs[index]);
                }
                while(shuffledArray.includes(songs[random])){                        
                    random = Math.floor(Math.random()*songs.length);  
                }
                playMusic(songs[random]);
                shuffledArray.unshift(songs[random]);
                if(shuffledArray.length > 7) shuffledArray.pop();
            }
        }
        else {
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if((index-1) >= 0){
                playMusic(songs[index-1]);
            }
            
        }
    })

    next.addEventListener("click", ()=>{
        if(shuffleFlag == true){
            let index = shuffledArray.indexOf(currentSong.src.split("/").slice(-1)[0]);
            console.log(index);
            if(shuffledArray[index+1] != undefined && index != "-1"){
                playMusic(shuffledArray[index+1]);
            }
            else{
                index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
                let random = Math.floor(Math.random()*songs.length);
                // console.log(songs[index+1]);
                if(!shuffledArray.includes(songs[index])){
                    // console.log("if");
                    shuffledArray.push(songs[index]);
                }
                while(shuffledArray.includes(songs[random])){                        
                    random = Math.floor(Math.random()*songs.length);  
                }
                playMusic(songs[random]);
                shuffledArray.push(songs[random]);
                if(shuffledArray.length > 7) shuffledArray.shift();
            }
        }
        else{
                console.log("c")
                index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
                // console.log(songs[index+1]);
                if((index+1) < songs.length){
                    playMusic(songs[index+1]);
                }
        }
    })