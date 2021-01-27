const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
    deezer: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    group: {
        type: Array,
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
        type: Number,
        required: true
    },
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