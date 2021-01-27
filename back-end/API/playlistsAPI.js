const express       = require('express');
const router        = express.Router();
const Playlist      = require("../models/Playlists");
const authentified  = require("../middleware/auth");

router.get('/playlists', authentified, (req, res) => {
    const token = req.cookies.token;
    Playlist.find( {}, {date: 0} ).then(async(playlist) => {
        var playlistAll = [];
        if (playlist) {
            playlist.forEach(el => {
                if ((el.private == true && el.user == token) || (el.private == false) ){
                    playlistAll.push({
                        uuid: el._id,
                        creator: el.user,
                        tracks: el.tracks,
                        likes: el.likes.length,
                        dislikes: el.dislikes.length,
                        events: el.inEvents
                    });
                }
            });
            res.json({statut: 200, data: playlistAll});
        } else {
            res.json({statut: 400, res:'No playlist'})
        }
    }).catch(err => {
        return res.json({statut: 400, res:'Invalid request, please try again'});
    });
});

router.get('/playlists/:id', authentified, (req, res) => {
    const id = req.params.id;
    const token = req.cookies.token;
    Playlist.findById( id ).then(async(playlist) => {
        if (playlist && ( (el.private == true && el.user == token) || el.private == false) ) {
            res.json({statut: 200, data:{
                uuid: playlist._id,
                creator: playlist.user,
                tracks: playlist.tracks,
                likes: playlist.likes.length,
                dislikes: playlist.dislikes.length,
                events: playlist.inEvents
            }});
        } else if(!accessPlaylist) {
            res.json({statut: 403, res:'Access denied'})
        } else {
            res.json({statut: 400, res:'User not found'})
        }
    }).catch(err => {
        return res.json({statut: 400, res:'Invalid id'});
    });
});

module.exports = router;