const express       = require('express');
const router        = express.Router();
const usersAPI      = require("./usersAPI");
const playlistsAPI  = require("./playlistsAPI.js");

router.use('/users',       usersAPI);
router.use('/playlists',   playlistsAPI);

module.exports = router;