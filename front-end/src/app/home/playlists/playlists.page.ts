import { Component, OnInit } from '@angular/core';
import { environment }            from './../../../environments/environment';
import axios from 'axios';
import { stringify } from '@angular/compiler/src/util';

declare var $: any;

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.page.html',
  styleUrls: ['./playlists.page.scss'],
})
export class PlaylistsPage implements OnInit {

  public  yourPlaylists;
  public  allPlaylists;

  public  tracksToPlayPlaylistPage:Array<any>;
  public  playlistToDelete = {id: '', name: ''};
  public  isPrivateCreatePlaylist:boolean = false;
  public  isPrivateEditPlaylist:boolean = false;

  public  listeningPlaylist = {id: '', name: '', admin:false, admins: [], liked: false, private:false}
  public  currentlyPlayingTrack = {cover: '', name: '', group:''};
  public  playIcon:boolean = false;
  private currentSong:number = 0;
  public  audio;

  public  allowEditPlaylist:boolean = false;

  constructor() {
  }


  private playSong()
  {
    this.audio.src = this.tracksToPlayPlaylistPage[this.currentSong].url;
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

  public likePlaylist()
  {
    axios({url: `${environment.backEndUrl}/api/playlists/${this.listeningPlaylist.id}/like`, method: 'get', withCredentials: true})
      .then(res => {
        if (res.data.statut == 200) { this.listeningPlaylist.liked = !this.listeningPlaylist.liked; }
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

  public returnToPlaylists()
  {
    $('#listenToPlaylist').addClass('d-none');
    $('#tabsExplorer').removeClass('d-none');
    this.audio.pause();
  }

  public previousSong()
  {
    this.audio.pause();
    this.currentSong == 0 ? this.currentSong = this.tracksToPlayPlaylistPage.length - 1 : this.currentSong--;
    this.currentlyPlayingTrack = this.tracksToPlayPlaylistPage[this.currentSong];
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
    this.currentlyPlayingTrack = this.tracksToPlayPlaylistPage[this.currentSong];
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
    $('#tabsExplorer').addClass('d-none');
    this.currentSong = 0;
    var listOfTracksIDs;
    this.tracksToPlayPlaylistPage = await axios({url: `${environment.backEndUrl}/api/playlists/${id}`, method: 'get', withCredentials: true})
      .then(res => {
        this.listeningPlaylist = {id: res.data.data.uuid, name: res.data.data.title, admin:res.data.data.admin, admins: res.data.data.adminsUsername, private: res.data.data.private, liked: res.data.data.liked};
        listOfTracksIDs = res.data.data.tracks;
        return res.data.data.tracks;
    });
    this.isPrivateEditPlaylist = this.listeningPlaylist.private;
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
    this.currentlyPlayingTrack = this.tracksToPlayPlaylistPage[0];
    $('#listenToPlaylist').removeClass('d-none');
    this.audio = new Audio();
    this.playSong();
    this.audio.addEventListener("timeupdate", () => {
      let position = this.audio.currentTime / this.audio.duration;
      $('.fill').width(position * 100 + "%");
      this.convertTime(Math.round(this.audio.currentTime));
      if (this.audio.currentTime == this.audio.duration) { this.nextSong() }
    });
  }


  private async getAllPlaylists()
  {
    await axios({url: `${environment.backEndUrl}/api/playlists/`, method: 'get', withCredentials: true}).then(res=>{
        this.allPlaylists = res.data.data;
    });
  }

  private async getYourPlaylists()
  {
    await axios({url: `${environment.backEndUrl}/api/playlists/me`, method: 'get', withCredentials: true}).then(res=>{
        this.yourPlaylists = res.data.data;
    });
  }

  public openFormCreateTab()
  {
    $('#createPlaylistModal').modal('show');
  }

  public async createPlaylist(name:string)
  {
    if (name.length < 3 || name.length > 10) {
      $('#alertBoxPlaylistCreation').removeClass('d-none');
      $('#alertBoxPlaylistCreation').addClass('alert-danger');
      $('#alertCaption').html("The name of your playlist should contains between 3 and 10 characters!");
      return;
    }
    $('#createPlaylistBtn').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
    await axios({url: `${environment.backEndUrl}/api/playlists/new`, method: 'post', data: {name: name, private: this.isPrivateCreatePlaylist}, withCredentials: true}).then(res=>{
        $('#alertBoxPlaylistCreation').removeClass('d-none');
        if (res.data.statut == 200) {
          $('#alertBoxPlaylistCreation').removeClass('alert-danger');
          $('#alertBoxPlaylistCreation').addClass('alert-success');
          $('#alertCaption').html('Playlist successfully created!');
          this.getAllPlaylists();
          this.getYourPlaylists();
        } else {
          $('#alertBoxPlaylistCreation').removeClass('alert-success');
          $('#alertBoxPlaylistCreation').addClass('alert-danger');
          $('#alertCaption').html("An error occured with the creation of the playlist");
        }
    });
    $('#createPlaylistBtn').html('Create');
  }

  public openModalDeletePlaylist(id:string, name:string)
  {
    this.playlistToDelete = {id: id, name: name};
    $('#deletePlaylistModal').modal('show');
  }

  public async deletePlaylist()
  {
    await axios({url: `${environment.backEndUrl}/api/playlists/delete/${this.playlistToDelete.id}`, method: 'get', withCredentials: true})
    this.getAllPlaylists();
    this.getYourPlaylists();
    $('#deletePlaylistModal').modal('hide');
  }

  public returnToTrack()
  {
    $('#editPlaylistDiv').addClass('d-none');
    $('#listenToPlaylist').removeClass('d-none');
    $('#alertBoxPlaylistEdit').addClass('d-none');
    $('#alertBoxPlaylistEdit').removeClass('alert-success', 'alert-danger');
  }

  public editPlaylist()
  {
    $('#editPlaylistDiv').removeClass('d-none');
    $('#listenToPlaylist').addClass('d-none');
  }

  public editPlaylistInfos()
  {
    $('#editPlaylistModal').modal('show');
  }

  public async removeTrackFromPlaylist(spotify:string)
  {
    await axios({url: `${environment.backEndUrl}/api/playlists/add/${this.listeningPlaylist.id}/${spotify}`, method: 'get', withCredentials: true})
    .then(res => {
      if (res.data.statut == 200) {
         $(`#row_${spotify}`).remove();
      }
    });
    this.getAllPlaylists();
    this.getYourPlaylists();
  }

  public async editPlaylistForm(name:string, admins:string) 
  {
    if (name.length < 3 || name.length > 10) {
      $('#alertBoxPlaylistEdit').removeClass('d-none');
      $('#alertBoxPlaylistEdit').addClass('alert-danger');
      $('#alertEditCaption').html("The name of your playlist should contains between 3 and 10 characters!");
      return;
    }
    admins = admins.replace(/\s+/g, ' ');
    $('#saveEditPlaylist').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
    await axios({url: `${environment.backEndUrl}/api/playlists/update`, method: 'post', data: {playlist: this.listeningPlaylist.id, name: name, private: this.isPrivateEditPlaylist, admins: admins}, withCredentials: true}).then(res=>{
        $('#alertBoxPlaylistEdit').removeClass('d-none');
        if (res.data.statut == 200) {
          $('#alertBoxPlaylistEdit').removeClass('alert-danger');
          $('#alertBoxPlaylistEdit').addClass('alert-success');
          $('#alertEditCaption').html('Playlist edited successfully!');
          this.getAllPlaylists();
          this.getYourPlaylists();
        } else {
          $('#alertBoxPlaylistCreation').removeClass('alert-success');
          $('#alertBoxPlaylistCreation').addClass('alert-danger');
          $('#alertEditCaption').html("An error occured with the creation of the playlist");
        }
    });
    $('#saveEditPlaylist').html('Save');
  }
  async ngOnInit() {
    await this.getAllPlaylists();
    await this.getYourPlaylists();
  }

}
