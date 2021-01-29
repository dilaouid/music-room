const express       = require('express');
const router        = express.Router();
const Music         = require("../models/Musics");
const authentified  = require("../middleware/auth");
const axios         = require('axios');
const deezerURL     = 'https://api.deezer.com';

const addMusicToDB = async (id) => {
    var data;
    var res = { statut: 400, data: 'An error occured' };
    await axios.get(`${deezerURL}/track/${id}`).then( async (res) => {
        data = {
            deezer:     res.data.id,
            title:      res.data.title,
            group:      res.data.artist,
            date:       res.data.release_date,
            image:      res.data.album.cover,
            duration:   res.data.duration
        };
        await new Music(data).save();
    }).catch((err) => {
        console.log(err);
    });
    if (data) {
        await Music.findOne( {deezer: id} ).then(async(music) => {
            res = {
                statut: 200,
                data: {
                    uuid:       music._id,
                    deezer:     music.deezer,
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
    var   data = await axios.get(`${deezerURL}/search?q=${name}&strict=on`);
    data = data.data;
    var     musicList = [];
    var     addMusic;
    for (let i = 0; i < data.data.length; i++) {
        const el = data.data[i];
        await Music.findOne( {deezer: el.id }).then( async (music) => {
            if (music) {
                musicList.push({
                    uuid:       music._id,
                    deezer:     music.deezer,
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
                addMusic = await addMusicToDB(el.id);
                if (addMusic.data)
                    musicList.push({
                        uuid:       addMusic.data.uuid,
                        deezer:     addMusic.data.deezer,
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

router.get('/', authentified, (req, res) => {
    Music.find( {} ).then(async(music) => {
        var musicList = [];
        if (music) {
            music.forEach(el => {
                musicList.push({
                    uuid:       el._id,
                    deezer:     el.deezerid,
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
    const name = req.query.name;
    if (name && name.length > 3) {
        var musicList = await addNewTrackByName(name);
        res.json({statut: 200, res: musicList})
    } else {
        res.json({statut: 400, res:'Name must me contains at least 3 characters'})
    }
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    Music.findOne( {deezer: id} ).then(async(music) => {
        if (music) {
            res.json({statut: 200, data:{
                uuid:       music._id,
                deezer:     music.deezer,
                duration:   music.duration,
                title:      music.title,
                group:      music.group,
                cover:      music.image,
                release:    music.date,
                likes:      music.likes == undefined    ? 0 : music.likes.length,
                dislikes:   music.dislikes == undefined ? 0 : music.dislikes.length,
                playlists:  music.inPlaylists,
                looped:     music.listened
            }});
        } else {
            var data = await addMusicToDB(id);
            res.json({statut: data.statut, data: data.data})
        }
    }).catch(err =>  {
        console.log(err)
        return res.json({statut: 400, res:'Invalid id'});
    });
});


module.exports = router;