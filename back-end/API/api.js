const express       = require('express');
const router        = express.Router();

const usersAPI      = require("./usersAPI");
const playlistsAPI  = require("./playlistsAPI.js");
const tracksAPI     = require("./tracksAPI.js");

router.use('/users',       usersAPI);
router.use('/playlists',   playlistsAPI);
router.use('/tracks',      tracksAPI);


module.exports = router;