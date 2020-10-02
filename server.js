const express = require('express');
const app = express();
const mongoose = require('mongoose')
const Song = require('./models/song.js')

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())

mongoose.connect('mongodb://localhost/songRecorder', {
    useNewUrlParser: true, useUnifiedTopology: true
})

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/songs', async (req, res) => {
    const song = new Song({
        name: req.body.name,
        notes: req.body.songNotes,
        note_long: req.body.note_long
    })
    await song.save()
    res.json(song)
})

app.get('/allSongs', (req, res) =>{
    Song.find()
    .then(data => {
        res.json(data)
    })
    .catch(err => {
        res.json(err)
    })
})
app.get('/song/:id', async (req, res) => {
    let song
    try {
        song = await Song.findById(req.params.id)
    } catch (e) {
        song = undefined
    }
    res.render('index', { song: song })
})
app.delete('/delete/:id', async (req,res) => {
    await Song.findByIdAndDelete(req.params.id)
    .then(result => {
        res.json(result)
    })
    .catch(err => {
        console.log(err)
    })
})

app.listen(8000, () => console.log('listening on 8000'))