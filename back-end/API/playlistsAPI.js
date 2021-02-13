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

router.get('/', authentified, async (req, res) => {
    const token = req.cookies.token;
    const user = await getInfos(token);
    Playlist.find( {}, {date: 0} ).then(async(playlist) => {
        var playlistAll = [];
        if (playlist) {
            playlist.forEach(el => {
                if ((el.private == true && el.admins.includes(user.id)) || (el.private == false) ){
                    playlistAll.push({
                        uuid: el._id,
                        title: el.name,
                        admins: el.admins,
                        tracks: el.tracks,
                        likes: el.likes.length,
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

router.get('/me', authentified, async (req, res) => {
    const token = req.cookies.token;
    const user = await getInfos(token);
    const userid = user.id;
    await Playlist.find( {"admins": { $elemMatch: { $eq: userid } }}, {date: 0} ).then(data => {
        if (data) {
            res.json({statut: 200, data: data});
        } else {
            res.json({statut: 400, res:'No playlist'})
        }
    })
});

router.get('/:id', authentified, async (req, res) => {
    const id = req.params.id;
    const token = req.cookies.token;
    const user = await getInfos(token);
    Playlist.findById( id ).then(async(playlist) => {
        if (playlist && ( (playlist.private == true && playlist.admins.includes(user.id)) || playlist.private == false) ) {
            var adminsUsername = [];
            for (let i = 0; i < playlist.admins.length; i++) {
                await User.findById(playlist.admins[i]).then(us => {
                    adminsUsername.push(us.username);
                })
            }
            res.json({statut: 200, data:{
                title: playlist.name,
                uuid: playlist._id,
                admins: playlist.admins,
                adminsUsername: adminsUsername,
                tracks: playlist.tracks,
                likes: playlist.likes.length,
                events: playlist.inEvents,
                liked: playlist.likes.includes(user.id),
                admin: playlist.admins.includes(user.id),
                private: playlist.private
            }});
        } else if(playlist.private == true && !playlist.admins.includes(user.id)) {
            res.json({statut: 403, res:'Access denied'})
        } else {
            res.json({statut: 404, res:'Playlist not found'})
        }
    }).catch(err => {
        console.log(err)
        return res.json({statut: 400, res:'Invalid id'});
    });
});

router.get('/delete/:id', authentified, async (req, res) => {
    const id = req.params.id;
    const token = req.cookies.token;
    const user = await getInfos(token);
    await Playlist.findOneAndDelete( { _id: id, "admins": { $elemMatch: { $eq: user.id } }} ).then( async data => {
        if (data) {
            await User.updateMany( {"playlists": {$elemMatch: {$eq: id}}}, {$pull: {playlists: id}});
            return res.json({statut: 200, res:'OK'})
        } else {
            return res.json({statut: 403, res:'Access denied'})
        }
    }).catch(err => {
        console.log(err);
        return res.json({statut: 400, res:'An error occured'});
    });
});

router.post('/new', urlencodedParser, authentified, async (req, res) => {
    const token         = req.cookies.token;
    const valid         = validation.playlists(req.body);
    var userid          = await getInfos(token);
    if (valid.isValid == false) { res.json({ statut: 400, res:valid.errors }); }
    const newPlaylist = await new Playlist({
        admins: [userid.id],
        name:   sanitize(req.body.name),
        tracks: [],
        likes: [],
        inEvents: [],
        private: req.body.private
    }).save();
    User.findByIdAndUpdate(userid.id, { $push: { playlists:  newPlaylist._id.toString() } }, (err, model) => {
        console.log(err);
    })
    res.json({statut: 200, data:{
        admins: [userid.id],
        name:   sanitize(req.body.name)
    }});
});

router.get('/add/:id/:track', authentified, async (req, res) => {
    const   token         = req.cookies.token;
    const   playlistID    = req.params.id;
    const   musicID       = req.params.track;
    var     infos         = await getInfos(token);
    var     userid        = infos.id;
    var playlist = await Playlist.findById(playlistID).then(data => {
        if (data) { return (data); }
    });
    if (playlist == null) {
        res.json({statut: 400, res:'Playlist not found'})
    } else if (!playlist.admins.includes(userid)) {
        res.json({statut: 403, res:'Access denied'});
    } else {
        var music = await Music.findOne({spotify: musicID}).then(data => {
            if (data) {
                data.inPlaylists.includes(playlistID) ? data.inPlaylists.pull(playlistID) : data.inPlaylists.push(playlistID);
                data.save();
                return (data);
            }
        });
        if (music == null) { res.json({statut: 400, res:'Music not found'}); }
        if (playlist.tracks.includes(musicID)) {
            await Playlist.updateOne({"_id": playlistID}, { $pull: { tracks: musicID } });
            console.log(`${musicID} removed ${playlistID}`);
        } else {
            await Playlist.updateOne({"_id": playlistID}, { $push: { tracks:  musicID } });
            console.log(`${musicID} added to ${playlistID}`);
        }
        res.json({statut: 200, res:'OK'});
    }
});
router.post('/update', urlencodedParser, authentified, async (req, res) => {
    const   token         = req.cookies.token;
    var     infos         = await getInfos(token);
    var     userid        = infos.id;
    var     username      = infos.username;
    const   playlistID    = req.body.playlist;
    var playlist = await Playlist.findById(playlistID).then(data => {
        if (data) { return (data); }
    });
    if (playlist == null) {
        res.json({statut: 400, res:'Playlist not found'})
    } else if (!playlist.admins.includes(userid)) {
        res.json({statut: 403, res:'Access denied'});
    } else {
        var adminsParsed  = req.body.admins.length  > 0 ? req.body.admins.replace(/ /g,' ').split(' ')  : [username];
        var adminsID      = [userid];
        for (let i = 0; i < adminsParsed.length; i++) {
            await User.findOne({username : adminsParsed[i]}, (err, data) => {
                if (data && data._id != userid) { adminsID.push(data._id.toString()); }
            });
        }
        await Playlist.updateOne({"_id": playlistID}, { private: req.body.private, name: req.body.name, admins: adminsID });
        res.json({statut: 200, res:'OK' });
    }
});

module.exports = router;