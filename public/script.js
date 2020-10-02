const keys = document.querySelectorAll('.key')
const whiteKeys = document.querySelectorAll('.key.white')
const blackKeys = document.querySelectorAll('.key.black')
const recordButton = document.querySelector('.record-button')
const record_time = document.getElementById('record_time')
const playButton = document.querySelector('.play-button')
const saveButton = document.querySelector('.save-button')
const get_all_songs = document.getElementById('get_all_songs')
const WHITE_KEYS = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"]
const BLACK_KEYS = ['w', 'r', 't', 'u', 'i', 'o' ,'[']
// const WHITE_KEYS = ['e', 'r', 't', 'y', 'u', 'i', 'o', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'c', 'v', 'b',  'n', 'm', ',', ".", '/'   ]
// const BLACK_KEYS = ['s', 'd', 'g', 'h', 'j']

let timer, sec, min, recordingStartTime, note_long;
let songNotes = currentSong && currentSong.notes

const keyMap = [...keys].reduce((map, key) => {
    map[key.dataset.note] = key
    return map
}, {})


document.addEventListener('keydown', (e) => {
    if (e.repeat) return
    let key = e.key
    let white_keys_index = WHITE_KEYS.indexOf(key)
    let black_keys_index = BLACK_KEYS.indexOf(key)
    if(white_keys_index > -1) {
        playNote(whiteKeys[white_keys_index])
    }
    if(black_keys_index > -1) {
        playNote(blackKeys[black_keys_index])
    }
})
keys.forEach(key => {
    key.addEventListener('click', () => playNote(key))
})
if(recordButton){
    recordButton.addEventListener('click', toggleRecording)
}
function toggleRecording() {
    recordButton.classList.toggle('active');
    if(isRecording()){
        recordButton.innerHTML = 'Stop'
        playButton.classList.remove('show')
        saveButton.classList.remove('show')
        startRecording()
    }else {
        recordButton.innerHTML = 'Record'
        playButton.classList.add('show')
        saveButton.classList.add('show')
        clearInterval(timer);
        if(min > 0){
            note_long = (Number(min)*60)+sec
        }else {
            note_long = sec
        }
    }
}
function startTimeRecord() {
    if(sec == 60){
        min++;
        sec = 0;
    }
    record_time.innerHTML = `${min} : ${sec++}`;
}
function isRecording(){
    return recordButton != null && recordButton.classList.contains('active')
}
function startRecording() {
    sec = 0;
    min = 0;
    timer = setInterval(startTimeRecord, 1000);
    recordingStartTime = Date.now()
    songNotes = []
}
function playNote(key) {
    if(isRecording()){
        recordPlay(key.dataset.note)
    }
    let keyNote = document.getElementById(key.dataset.note);
    keyNote.currentTime = 0;
    keyNote.play();
    key.classList.add('active')
    keyNote.addEventListener('ended', () => {
        key.classList.remove('active')
    })
}
function recordPlay(note){
    songNotes.push({
        key:note,
        startTime: Date.now() - recordingStartTime
    })
}
playButton.addEventListener('click', () => {
    if (songNotes.length === 0) return
    songNotes.forEach(note => {
        setTimeout(() => {
            playNote(keyMap[note.key])
        }, note.startTime)
    })
})
if(saveButton){
    saveButton.addEventListener('click', () => {
        let noteName = prompt('name the note')
        let the_note = {
            name:noteName,
            songNotes,
            note_long
        }
        saveButton.innerHTML = 'Saving'
        axios.post('/songs', the_note)
        .then(res => {
            saveButton.innerHTML = 'Saved'
        })
        .catch(err => {
            console.log(err)
        })
    })
}
get_all_songs.addEventListener('click', () => {
    axios.get('/allSongs')
    .then(res => {
        showData(res.data)
    })
    .catch(err => {
        console.log(err)
    })
})
function showData(data){
    let all_songs = document.getElementById('all_songs_list')
    all_songs.innerHTML = ''
    if(data.length > 0){
        data.forEach(val => {
            let list_link = `<li><h3 class='all_songs_nav_bar'>${val.name}</h3><button class='quick_play' data-note-id=${val._id}>play</button> <button class="delete_one_song" data-note-id=${val._id}>Delete</button></li>`
            all_songs.innerHTML += list_link
        })
    }else {
        all_songs.innerHTML = 'Nothing to show'
    }
    setTimeout(() => {
        const quick_play = document.querySelectorAll('.quick_play')
        const delete_one_song = document.querySelectorAll('.delete_one_song')
        if(delete_one_song){
            delete_one_song.forEach( del => {
                del.addEventListener('click', () => {
                    axios.delete(`/delete/${del.dataset.noteId}`)
                    .then(res => {
                        window.location.href = 'http://localhost:8000/'
                    })
                    .catch(err => {
                        console.log(err)
                    })
                })
            })
        }
        if(quick_play){
            quick_play.forEach(play_note => {
                play_note.addEventListener('click', () => {
                    let the_note = ''
                    data.forEach(notes => {
                        if (notes._id === play_note.dataset.noteId){
                            test(notes, play_note)
                        }else {
                            the_note = ''
                        }
                    })
                })
            })
        }
    }, 1000)
}
function test(values, play_note) {
    songNotes = values.notes;
    let new_note_long = values.note_long
    if (songNotes.length === 0) return
    songNotes.forEach(note => {
        setTimeout(() => {
            playNote(keyMap[note.key])
        }, note.startTime)
    })
    if(new_note_long > 0){
        play_note.classList.add('play_active')
        var noteTime = setInterval(()=>{
            new_note_long--
            if(new_note_long <= 59){
                record_time.innerHTML = ` 0 : ${new_note_long}`;
            }
            if(new_note_long == 0){
                play_note.classList.remove('play_active')
                clearInterval(noteTime)
                record_time.innerHTML = `0 : 0`;
            }
        }, 1000)
    }
}