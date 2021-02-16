import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { environment }            from './../../../environments/environment';
import axios from 'axios';
import { stringify } from '@angular/compiler/src/util';

declare var $: any;

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {

  constructor() { }

  public  viewProfilLikedTracks:Array<any>;

  public  searchUserValue;
  public  userList;
  public  viewprofile = {uuid: '', cover: '', mutual: false, username:'', followers:[], following:[], firstname:'',lastname:'', musical_preferences:[], playlists:[], likes:[]};
  public  viewProfilPlaylists;
  public  audio;
  public  playIcon;
  public  playingTrack:any = {uuid: null, id: 0, liked: false, name: null, url: null, cover: null, group: null, spotify: null};
  
  private currentSong:number = 0;

  public  tracksToPlayPlaylistPage:Array<any>;

  public  listeningPlaylist = {id: '', name: '', admin:false, admins: [], liked: false, private:false}

  private objectToArray = (obj => {
    var arr =[];
    for(let o in obj) {
      if (obj.hasOwnProperty(o)) {
        arr.push(obj[o]);
      }
    }
    return (arr);
  });

  public async searchUser(username:string)
  {
    await axios({url: `${environment.backEndUrl}/api/users/?search=${username}`, method: 'get', withCredentials: true})
    .then(res => {
        this.userList = [res.data.data];
    });
  }

  public async openProfile(profil)
  {
    this.viewprofile = profil;
    await this.getUserPlaylists();
    this.viewProfilLikedTracks = new Array(this.viewprofile.likes.length);
    await this.getLikedTracks();
    $('.padMar').addClass('d-none');
    $('#userlist').addClass('d-none');
    $('#profileTabFromUser').removeClass('d-none');
  }

  private async getAllUsers()
  {
    await axios({url: `${environment.backEndUrl}/api/users/?limit=10`, method: 'get', withCredentials: true})
    .then(res => {
        this.userList = this.objectToArray(res.data.data);
    });
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
    $('#profileTabFromUser').addClass('d-none');
    $('#tabsBtn').addClass('d-none');
    this.currentSong = 0;
    var listOfTracksIDs;
    this.tracksToPlayPlaylistPage = await axios({url: `${environment.backEndUrl}/api/playlists/${id}?search=playlist`, method: 'get', withCredentials: true})
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
    $('#listenToPlaylistFromUser').removeClass('d-none');
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
    this.playingTrack = this.viewProfilLikedTracks[index];
    $('#listenToTrackFromUser').removeClass('d-none');
    $('#profileTabFromUser').addClass('d-none');
    $('#tabsBtn').addClass('d-none');
    this.audio = new Audio();
    this.playSong();
    this.audio.addEventListener("timeupdate", () => {
      let position = this.audio.currentTime / this.audio.duration;
      $('.fill').width(position * 100 + "%");
      this.convertTime(Math.round(this.audio.currentTime));
    });
  }

  private async getLikedTracks()
  {
    for (let i = 0; i < this.viewprofile.likes.length; i++) {
      await axios({url: `${environment.backEndUrl}/api/tracks/${this.viewprofile.likes[i]}`, method: 'get', withCredentials: true}).then(res=>{
        this.viewProfilLikedTracks[i] = {
            uuid: res.data.data.uuid,
            cover: res.data.data.cover,
            group: res.data.data.group,
            title: res.data.data.title,
            url: res.data.data.url,
            playlists: res.data.data.playlists,
            duration: res.data.data.duration,
            liked: res.data.data.liked,
            id: this.viewprofile.likes[i],
            spotify: this.viewprofile.likes[i]
          };
      });
    }
    return (true);
  }

  public returnToUserList()
  {
    $('.padMar').removeClass('d-none');
    $('#userlist').removeClass('d-none');
    $('#profileTabFromUser').addClass('d-none');
  }
  
  private async getUserPlaylists()
  {
    await axios({url: `${environment.backEndUrl}/api/playlists/${this.viewprofile.uuid}?search=user`, method: 'get', withCredentials: true}).then(res=>{
        this.viewProfilPlaylists = res.data.data;
    });
  }

  public async follow()
  {
    await axios({url: `${environment.backEndUrl}/api/users/follow/${this.viewprofile.uuid}`, method: 'get', withCredentials: true}).then(res=>{
        if ($('#followBtn').hasClass('btn-info')) {
          $('#followBtn').removeClass('btn-info');
          $('#followBtn').addClass('btn-danger');
          $('#followBtn').html('Unfollow');
          this.viewprofile.followers.push('a');
        } else {
          $('#followBtn').addClass('btn-info');
          $('#followBtn').removeClass('btn-danger');
          $('#followBtn').html('Follow');
          this.viewprofile.followers.pop();
        }
    });
  }

  public returnToUserPage()
  {
    $('#profileTabFromUser').removeClass('d-none');
    $('#tabsBtn').removeClass('d-none');
    $('#listenToPlaylistFromUser').addClass('d-none');
    $('#listenToTrackFromUser').addClass('d-none');
    this.audio.pause();
  }

  async ngOnInit() {
    await this.getAllUsers();
  }

}
