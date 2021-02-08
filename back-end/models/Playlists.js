const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    admins: {
        type: Array,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    private: {
        type: Boolean,
        default: false,
    },
    tracks:{
        type: Array,
        default: []
    }, // [musicID, musicID, musicID]
    inEvents:{
        type: Array,
        default: []
    }, // [eventID, eventID, eventID]
    likes:{
        type: Array,
        default: []
    }, // [userID, userID, userID]
});

module.exports = Playlist = mongoose.model("playlists", playlistSchema);