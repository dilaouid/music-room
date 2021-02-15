import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { environment }            from './../../../environments/environment';
import axios from 'axios';
import { stringify } from '@angular/compiler/src/util';

declare var $: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  public  yourPlaylists;

  public  playIcon:boolean = false;
  public  playingTrack:any = {uuid: null, id: 0, liked: false, name: null, url: null, cover: null, group: null, spotify: null};

  public  availablePreferences:Array<string> = [
    "Pop",
    "Rock",
    "Metal",
    "Electro",
    "Jazz",
    "Rap",
    "Classic",
    "Funk",
    "Retro",
    "Country",
    "Soul",
    "Reggae",
    "Disco"
  ];
  public  choosedPreference:any = [];

  public  tracksToPlayPlaylistPage:Array<any>;
  public  likedTracks:Array<any>;

  public  playlistsToAddTrack = [];

  public  previousLikesNB:number = 0;

  public  listeningPlaylist = {id: '', name: '', admin:false, admins: [], liked: false, private:false}

  public  user = {username: '', lastname: '', img: '', firstname: '', likes: [], musical_preferences: []}
  private currentSong:number = 0;
  public  audio;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.getUserInfos();
    this.choosedPreference = this.user.musical_preferences;
   }

  private objectToArray = (obj => {
    var arr =[];
    for(let o in obj) {
      if (obj.hasOwnProperty(o)) {
        arr.push(obj[o]);
      }
    }
    return arr;
  });
  
  public async addToPlaylist(playlistID:string, spotifyID:string)
  {
    await axios({url: `${environment.backEndUrl}/api/playlists/add/${playlistID}/${spotifyID}`, method: 'get', withCredentials: true})
      .then(res => {
        if (res.data.statut == 200) {
           $(`#row_${playlistID}`).remove();
        }
    })
  }

  private playSong()
  {
    this.audio.src = this.playingTrack.url;
    this.audio.play();
  }

  private togglePlay()
  {
    this.playIcon = !this.playIcon;
    if (this.audio.paused) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
  }

  public likeTrack()
  {
    axios({url: `${environment.backEndUrl}/api/tracks/${this.playingTrack.id}/like`, method: 'get', withCredentials: true})
      .then(res => {
        if (res.data.statut == 200) { this.playingTrack.liked = !this.playingTrack.liked; }
    });
  }

  private convertTime(seconds)
  {
    let min = Math.floor(seconds/60).toString();
    let sec = (seconds % 60).toString();
    min = parseInt(min) < 10 ? "0" + min : min;
    sec = parseInt(sec) < 10 ? "0" + sec : sec;

    $('.time').html(min + ":" + sec);
    this.totalTime(Math.round(this.audio.duration));
  }

  private totalTime(seconds)
  {
    let min = Math.floor(seconds/60).toString();
    let sec = (seconds % 60).toString();
    min = parseInt(min) < 10 ? "0" + min : min;
    sec = parseInt(sec) < 10 ? "0" + sec : sec;

    $('.time').html($('.time').html() + "  -  " + min + ":" + sec);
  }

  public decreaseVolume()
  {
    if (this.audio.volume > 0) { this.audio.volume -= 0.25; }
  }

  public increaseVolume()
  {
    if (this.audio.volume < 1) { this.audio.volume += 0.25; }
  }

  public previousSong()
  {
    this.audio.pause();
    this.currentSong == 0 ? this.currentSong = this.tracksToPlayPlaylistPage.length - 1 : this.currentSong--;
    this.playingTrack = this.tracksToPlayPlaylistPage[this.currentSong];
    this.audio = new Audio();
    this.playSong();
    this.audio.addEventListener("timeupdate", () => {
      let position = this.audio.currentTime / this.audio.duration;
      $('.fill').width(position * 100 + "%");
      this.convertTime(Math.round(this.audio.currentTime));
      if (this.audio.currentTime == this.audio.duration) { this.nextSong() }
    });
  }

  public nextSong()
  {
    this.audio.pause();
    this.currentSong < this.tracksToPlayPlaylistPage.length - 1 ? this.currentSong++ : this.currentSong = 0;
    this.playingTrack = this.tracksToPlayPlaylistPage[this.currentSong];
    this.audio = new Audio();
    this.playSong();
    this.audio.addEventListener("timeupdate", () => {
      let position = this.audio.currentTime / this.audio.duration;
      $('.fill').width(position * 100 + "%");
      this.convertTime(Math.round(this.audio.currentTime));
      if (this.audio.currentTime == this.audio.duration) { this.nextSong() }
    });
  }

  public async playPlaylist(id:string, tracksLen:number)
  {
    if (tracksLen == 0) { console.log('No tracks'); return ; }
    $('#profileTab').addClass('d-none');
    this.currentSong = 0;
    var listOfTracksIDs;
    this.tracksToPlayPlaylistPage = await axios({url: `${environment.backEndUrl}/api/playlists/${id}`, method: 'get', withCredentials: true})
      .then(res => {
        this.listeningPlaylist = {id: res.data.data.uuid, name: res.data.data.title, admin:res.data.data.admin, admins: res.data.data.adminsUsername, private: res.data.data.private, liked: res.data.data.liked};
        listOfTracksIDs = res.data.data.tracks;
        return res.data.data.tracks;
    });
    for (let i = 0; i < listOfTracksIDs.length; i++) {
      this.tracksToPlayPlaylistPage[i] = await axios({url: `${environment.backEndUrl}/api/tracks/${listOfTracksIDs[i]}`, method: 'get', withCredentials: true})
          .then(res => { return ({
            id: id,
            uuid: res.data.data.uuid,
            name: res.data.data.title,
            cover: res.data.data.cover,
            group: res.data.data.group,
            url: res.data.data.url,
            spotify: res.data.data.spotify
          });
      });
    }
    this.playingTrack = this.tracksToPlayPlaylistPage[0];
    $('#listenToPlaylistFromProfile').removeClass('d-none');
    this.audio = new Audio();
    this.playSong();
    this.audio.addEventListener("timeupdate", () => {
      let position = this.audio.currentTime / this.audio.duration;
      $('.fill').width(position * 100 + "%");
      this.convertTime(Math.round(this.audio.currentTime));
      if (this.audio.currentTime == this.audio.duration) { this.nextSong() }
    });
  }

  public async playMusic(index:number)
  {
    this.playingTrack = this.likedTracks[index];
    $('#listenToTrackFromProfile').removeClass('d-none');
    $('#profileTab').addClass('d-none');
    $('#tabsBtn').addClass('d-none');
    this.audio = new Audio();
    this.playSong();
    this.audio.addEventListener("timeupdate", () => {
      let position = this.audio.currentTime / this.audio.duration;
      $('.fill').width(position * 100 + "%");
      this.convertTime(Math.round(this.audio.currentTime));
    });
  }

  public returnToProfile()
  {
    $('#listenToTrackFromProfile').addClass('d-none');
    $('#listenToPlaylistFromProfile').addClass('d-none');
    $('#profileTab').removeClass('d-none');
    $('#tabsBtn').removeClass('d-none');
    this.audio.pause();
    this.playIcon = false;
  }

  public editProfile()
  {
    $('#listenToTrackFromProfile').addClass('d-none');
    $('#listenToPlaylistFromProfile').addClass('d-none');
    $('#editProfile').modal('show');
  }

  public async logout()
  {
    await axios({url: `${environment.backEndUrl}/authenticate/logout`, method: 'get', withCredentials: true});
    this.router.navigateByUrl('/login');
  }

  private async getYourPlaylists()
  {
    await axios({url: `${environment.backEndUrl}/api/playlists/me`, method: 'get', withCredentials: true}).then(res=>{
        this.yourPlaylists = res.data.data;
    });
  }

  public async getUserInfos()
  {
    await axios({url: `${environment.backEndUrl}/api/users/me`, method: 'get', withCredentials: true}).then(res=>{
      this.user = res.data.data;
    });
  }

  public async openModalAddPlaylist()
  {
    await axios({url: `${environment.backEndUrl}/api/playlists/me`, method: 'get', withCredentials: true})
    .then(res => {
      this.playlistsToAddTrack = res.data.data;
    });
    for (let i = 0; i < this.playlistsToAddTrack.length; i++) {
      if (this.playlistsToAddTrack[i].tracks.includes(this.playingTrack.spotify)) {
        this.playlistsToAddTrack.splice(i, 1);
      }
    }
    $('#addToPlaylist').show()
    $('#addToPlaylist').modal("show");
  }

  private async getLikedTracks()
  {
    for (let i = 0; i < this.user.likes.length; i++) {
      await axios({url: `${environment.backEndUrl}/api/tracks/${this.user.likes[i]}`, method: 'get', withCredentials: true}).then(res=>{
        this.likedTracks[i] = {
            uuid: res.data.data.uuid,
            cover: res.data.data.cover,
            group: res.data.data.group,
            title: res.data.data.title,
            url: res.data.data.url,
            playlists: res.data.data.playlists,
            duration: res.data.data.duration,
            liked: res.data.data.liked,
            id: this.user.likes[i],
            spotify: this.user.likes[i]
          };
      });
    }
    return (true);
  }

  public async updateUser(username:string, firstname:string, lastname:string, password:string, confirmpassword:string)
  {
    $('#alertBoxProfileEdit').removeClass('d-none');
    username = username.replace(/\s/g,'');
    if (username.length < 3) {
      $('#alertBoxProfileEdit').addClass('alert-danger');
      $('#alertEditProfileCaption').html('You must enter an username which contains at least 3 characters!')
      return false;
    } else if (username == this.user.username) {
      username = '';
    }
    if (password && (password != confirmpassword || password.length < 8)) {
      $('#alertBoxProfileEdit').addClass('alert-danger');
      $('#alertEditProfileCaption').html('The passwords must be identical and contains at least 8 characters (uppercase, lowercase, number, symbols');
      return false;
    }
    $('#updateBtn').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
    await axios({url: `${environment.backEndUrl}/api/users/update`, method: 'post', data: {username: username, lastname: lastname, password: password, firstname: firstname, preferences: this.choosedPreference.join(' ')}, withCredentials: true}).then(res=>{
      if (res.data.statut == 200) {
        $('#alertBoxProfileEdit').removeClass('alert-danger');
        $('#alertBoxProfileEdit').addClass('alert-success');
      } else {
        $('#alertBoxProfileEdit').removeClass('alert-success');
        $('#alertBoxProfileEdit').addClass('alert-danger');
      }
      $('#alertEditProfileCaption').html(res.data.msg);
    });
    $('#updateBtn').html('Edit profile');
    await this.getUserInfos();
    this.choosedPreference = this.user.musical_preferences;
  }

  public async getAllInfos()
  {
    if (this.previousLikesNB != this.user.likes.length) {
      this.previousLikesNB = this.user.likes.length;
      this.likedTracks = new Array(this.user.likes.length);
      await this.getLikedTracks();
    }
    await this.getYourPlaylists();
  }

  private removeItemOnce(arr, value)
  {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }

  public takePreference(genre)
  {
    if (!this.availablePreferences.includes(genre)) { return ; }
    var dom = $(`#${genre}`);
    if (dom.hasClass('badge-secondary')) {
      dom.removeClass('badge-secondary');
      dom.addClass('badge-info');
      this.choosedPreference.push(genre);
    } else {
      dom.addClass('badge-secondary');
      dom.removeClass('badge-info');
      this.choosedPreference = this.removeItemOnce(this.choosedPreference, genre);
    }
  }

  async ngOnInit() {
    var that = this;
    setInterval(async function () {
      await that.getAllInfos();
    }, 2000);
  }

}
