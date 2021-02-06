const express       = require('express');
const router        = express.Router();
const Music         = require("../models/Musics");
const authentified  = require("../middleware/auth");
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
    clientId:       process.env.SPOTIFY_ID,
    clientSecret:   process.env.SPOTIFY_SECRET,
    redirectUri:    `http://localhost:${process.env.PORT}/callback`,
    accessToken:    process.env.ACCESS_TOKEN
});

spotifyApi.setAccessToken(process.env.ACCESS_TOKEN);

const convertTime(millis => {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
});

const addMusicToDB = async (el, searchForMusic) => {
    var data;
    var res = { statut: 400, data: 'An error occured' };
    if (searchForMusic == true) {
        data = {
            spotify:    el.id,
            title:      el.name,
            group:      el.artists[0].name,
            date:       el.album.release_date,
            image:      el.album.images[0].url,
            duration:   convertTime(el.duration_ms)
        };
    } else {
        data = await spotifyApi.getTrack(el.id).then(resp => {
            data = {
                spotify:    resp.body.id,
                title:      resp.body.name,
                group:      resp.body.artists[0].name,
                date:       resp.body.album.release_date,
                image:      resp.body.album.images[0].url,
                duration:   convertTime(resp.body.duration_ms)
            };
            return (data);
        });
        await new Music(data).save();
    }
    if (data) {
        await Music.findOne( {spotify: data.spotify} ).then( (music) => {
            res = {
                statut: 200,
                data: {
                    uuid:       music._id,
                    spotify:    music.spotify,
                    duration:   music.duration,
                    title:      music.title,
                    group:      music.group,
                    cover:      music.image,
                    date:       music.date,
                    likes:      0,
                    dislikes:   0,
                    playlists:  [],
                    looped:     0
                }
            }
        });
        return (res);
    }
}

const addNewTrackByName = async (name) => {
    var data          = await spotifyApi.searchTracks(`track:${name}`).then(data => { return (data.body.tracks.items); });
    var     musicList = [];
    var     addMusic;
    for (let i = 0; i < data.length; i++) {
        const el = data[i];
        await Music.findOne( {spotify: el.id }).then( async (music) => {
            if (music) {
                musicList.push({
                    uuid:       music._id,
                    spotify:    music.spotify,
                    duration:   music.duration,
                    title:      music.title,
                    group:      music.group,
                    cover:      music.image,
                    date:       music.date,
                    likes:      music.likes    == undefined ? 0 : music.likes.length,
                    dislikes:   music.dislikes == undefined ? 0 : music.dislikes.length,
                    playlists:  music.inPlaylists,
                    looped:     music.listened
                });
            } else {
                addMusic = await addMusicToDB(el, false);
                if (addMusic.data)
                    musicList.push({
                        uuid:       addMusic.data.uuid,
                        spotify:    addMusic.data.spotify,
                        duration:   addMusic.data.duration,
                        title:      addMusic.data.title,
                        group:      addMusic.data.group,
                        cover:      addMusic.data.image,
                        date:       addMusic.data.date,
                        likes:      0,
                        dislikes:   0,
                        playlists:  addMusic.data.playlists,
                        looped:     addMusic.data.looped
                    });
            }
            }).catch (err => {
                console.log(err);
            });
    }
    return (musicList);
};

router.get('/test', (req, res) => {
    /* spotifyApi.searchTracks('track: Boulevard of Broken Dreams', {limit: 1}) */
    spotifyApi.getTrack('1hwJKpe0BPUsq6UUrwBWTw')
    .then(function(data) {
        res.send(data.body);
    }, function(err) {
    res.send(err);
    });
});

router.get('/all', authentified, async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 0;
    var count   = Math.floor(Math.random() * await Music.countDocuments());
    await Music.find( {} ).limit(limit).skip(count).then(async(music) => {
        var musicList = [];
        if (music) {
            music.forEach(el => {
                musicList.push({
                    uuid:       el._id,
                    spotify:    el.spotify,
                    duration:   el.duration,
                    title:      el.title,
                    group:      el.group,
                    cover:      el.image,
                    release:    el.date,
                    likes:      el.likes.length,
                    dislikes:   el.dislikes.length,
                    playlists:  el.inPlaylists,
                    looped:     el.listened
                });
            });
            res.json({statut: 200, data: musicList});
        } else {
            res.json({statut: 400, res:'No musics'})
        }
    });
});

router.get('/search', async (req, res) => {
    const name  = req.query.name;
    if (name && name.length >= 3) {
        var musicList = await addNewTrackByName(name);
        res.json({statut: 200, res: musicList})
    } else {
        res.json({statut: 400, res:'Name must me contains at least 3 characters'})
    }
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    Music.findOne( {spotify: id} ).then(async(music) => {
        if (music) {
            res.json({statut: 200, data:{
                uuid:       music._id,
                spotify:    music.spotify,
                duration:   music.duration,
                title:      music.title,
                group:      music.group,
                cover:      music.image,
                release:    music.date,
                likes:      music.likes    == undefined ? 0 : music.likes.length,
                dislikes:   music.dislikes == undefined ? 0 : music.dislikes.length,
                playlists:  music.inPlaylists,
                looped:     music.listened
            }});
        } else {
            var data = await addMusicToDB(id, true);
            res.json({statut: data.statut, data: data.data})
        }
    }).catch(err =>  {
        console.log(err)
        return res.json({statut: 400, res:'Invalid id'});
    });
});


module.exports = router;