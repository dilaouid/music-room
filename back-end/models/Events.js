const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description:{
        type: String,
        default: ''
    },
    creation:{
        type: Date,
        default: Date.now
    },
    date:{
        type: Date,
        required: true
    },
    localisation: {
        type: String,
        required: true
    },
    playlist: {
        type: String,
        required: true
    },
    members: {
        type: Array,
        default: []
    }, // [userID, userID, userID]
    admins:{
        type: Array,
        default: []
    }, // [userID, userID, userID]
    private:{
        type: Boolean,
        default: 0
    },
    next:{
        type: String,
        default: ''
    },
    poll:{
        type: Array,
        default: []
    }, // [musicID, musicID, musicID]
});

module.exports = Event = mongoose.model("events", eventSchema);