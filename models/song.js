const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true
    },
    startTime: {
        type: Number,
        required: true
    }
})

const songSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        default:'test'
    },
    note_long : {
        type: Number,
        required: false,
        default:0
    },
    notes: [noteSchema]
})

module.exports = mongoose.model('Songs', songSchema)