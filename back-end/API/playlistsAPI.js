const express       = require('express');
const router        = express.Router();
const User          = require("../models/Users");
const Playlist      = require("../models/Playlists");
const Music         = require("../models/Musics");
const authentified  = require("../middleware/auth");
const validation    = require("../func/validation");
const getInfos      = require("../func/getInfos");
const sanitize      = require("mongo-sanitize");
const bodyParser    = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});

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
        if (playlist && ( (playlist.private == true && playlist.user == token) || playlist.private == false) ) {
            res.json({statut: 200, data:{
                uuid: playlist._id,
                creator: playlist.user,
                tracks: playlist.tracks,
                likes: playlist.likes.length,
                dislikes: playlist.dislikes.length,
                events: playlist.inEvents
            }});
        } else if(playlist.private == true && playlist.user == token) {
            res.json({statut: 403, res:'Access denied'})
        } else {
            res.json({statut: 400, res:'Playlist not found'})
        }
    }).catch(err => {
        return res.json({statut: 400, res:'Invalid id'});
    });
});

router.post('/new', urlencodedParser, authentified, async (req, res) => {
    const token         = req.cookies.token;
    const valid         = validation.playlists(req.body);
    var userid          = await getInfos(token);
    console.log(userid)
    if (valid.isValid == false) { res.json({ statut: 400, res:valid.errors }); }
    const newPlaylist = await new Playlist({
        user: userid.id,
        name: sanitize(req.body.name)
    }).save();
    User.findByIdAndUpdate(userid.id, { $push: { playlists:  newPlaylist._id } }, (err, model) => {
        console.log(err);
    })
    res.json({statut: 200, data:{
        user: userid.id,
        name: sanitize(req.body.name)
    }});
});

router.post('/update', urlencodedParser, authentified, async (req, res) => {
    const   token         = req.cookies.token;
    var     infos         = await getInfos(token);
    var     userid        = infos.id;
    const   playlistID    = req.body.playlist;
    const   musicID       = req.body.music;
    var playlist = await Playlist.findById(playlistID).then(data => {
        if (data) { return (data); }
    });
    if (playlist == null) {
        res.json({statut: 400, res:'Playlist not found'})
    } else if (playlist.user != userid) {
        res.json({statut: 403, res:'Access denied'});
    } else {
        var music = await Music.findById(musicID).then(data => {
            if (data) { return (data); }
        });
        if (music == null) { res.json({statut: 400, res:'Music not found'}); }
        if (playlist.tracks.includes(musicID)) {
            await Playlist.updateOne({"_id": playlistID}, { $pull: { tracks: musicID } });
            console.log(`${musicID} removed ${playlistID}`);
        } else {
            await Playlist.updateOne({"_id": playlistID}, { $push: { tracks:  musicID } });
            console.log(`${musicID} added to ${playlistID}`);
        }
        res.json({statut: 200, res:'OK' });
    }
});

module.exports = router;