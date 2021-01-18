const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        default: '',
        required: false
    },
    lastname: {
        type: String,
        required: false
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    birthday:{
        type: Date,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    img:{
        type: String,
        default: 'https://s.pngkit.com/png/small/193-1935688_znalezione-obrazy-dla-zapytania-thinking-emoji-meme-thinking.png'
    },
    following:{
        type: Array,
        default: []
    }, // [userID, userID, userID]
    followers:{
        type: Array,
        default: []
    }, // [userID, userID, userID]
    givenLikes: {
        type: Array,
        default: []
    }, // [musicID, musicID, musicID]
    givenDislikes: {
        type: Array,
        default: []
    }, // [musicID, musicID, musicID]
    playlists: {
        type: Array,
        default: []
    }, // [playlistID, playlistID, playlistID]
    events: {
        type: Array,
        default: []
    }, // [eventID, eventID, eventID]
    admin: {
        type: Boolean,
        default: false,
    }, // true = admin permissions
    oauthID: {
        type: String,
        default: ''
    },
    facebook: JSON,
    google: JSON
});

module.exports = User = mongoose.model("users", userSchema);