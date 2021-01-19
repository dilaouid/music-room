const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
    group: {
        type: String,
        required: true
    },
    date:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    duration:{
        type: String,
        required: true
    },
    genre:{
        type: Array,
        default: []
    }, // [genreA, genreB, genreC]
    likes:{
        type: Array,
        default: []
    }, // [userID, userID, userID]
    dislikes:{
        type: Array,
        default: []
    }, // [userID, userID, userID]
    listened:{
        type: Number,
        default: 0
    },
    inPlaylists:{
        type: Array,
        default: []
    }, // [playlistID, playlistID, playlistID]
});

module.exports = Music = mongoose.model("musics", musicSchema);