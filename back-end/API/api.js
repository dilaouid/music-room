const express       = require('express');
const router        = express.Router();
const bodyParser    = require('body-parser');

const usersAPI      = require("./usersAPI");
const playlistsAPI  = require("./playlistsAPI.js");
const tracksAPI     = require("./tracksAPI.js");
const eventsAPI     = require("./eventsAPI.js");

router.use('/users',       usersAPI);
router.use('/playlists',   playlistsAPI);
router.use('/tracks',      tracksAPI);
router.use('/events',      eventsAPI);

module.exports = router;