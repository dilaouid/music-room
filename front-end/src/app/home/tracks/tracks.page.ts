import { Component, OnInit, ɵConsole } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { environment }            from './../../../environments/environment';
import axios from 'axios';
import { stringify } from '@angular/compiler/src/util';

declare var $: any;

@Component({
  selector: 'app-tracks',
  templateUrl: './tracks.page.html',
  styleUrls: ['./tracks.page.scss'],
})
export class TracksPage implements OnInit {

  constructor() { }

  public  tracksTrackTab;
  public  searchTrackValue;
  public  playingTrack:any = {name: null, url: null, cover: null, group: null};
  public  playIcon:boolean = false;
  public  audio;


  private objectToArray = (obj => {
    var arr =[];
    for(let o in obj) {
      if (obj.hasOwnProperty(o)) {
        arr.push(obj[o]);
      }
    }
    return arr;
  });

  async searchTrack(track:string)
  {
    if (track.length >= 3)
    {
      $('#searchTrackBilan').removeClass('d-none');
      $('#searchTrackResults').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>')
      await axios({url: `${environment.backEndUrl}/api/tracks/search?name=${track}`, method: 'get', withCredentials: true})
      .then(res => {
          this.tracksTrackTab = this.objectToArray(res.data.res);
          $('#searchTrackResults').html(`${res.data.res.length} results for " ${track} "`)
      });
    }
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

  public returnToTrackList()
  {
    $('#listenToTrack').addClass('d-none');
    $('#tracks').removeClass('d-none');
    this.audio.pause();
  }

  public async playMusic(id:string)
  {
    await axios({url: `${environment.backEndUrl}/api/tracks/${id}`, method: 'get', withCredentials: true})
      .then(res => {
        this.playingTrack = {
          name: res.data.data.title,
          cover: res.data.data.cover,
          group: res.data.data.group,
          url: res.data.data.url
        };
    });
    $('#listenToTrack').removeClass('d-none');
    $('#tracks').addClass('d-none');
    this.audio = new Audio();
    this.playSong();
    this.audio.addEventListener("timeupdate", () => {
      let position = this.audio.currentTime / this.audio.duration;
      $('.fill').width(position * 100 + "%");
      this.convertTime(Math.round(this.audio.currentTime));
    });
  }

  public goBack()
  {
    $('#listenToTrack').addClass('d-none');
    $('#tracks').removeClass('d-none');
  }

  ngOnInit() {
    axios({url: `${environment.backEndUrl}/api/tracks/all?limit=10`, method: 'get', withCredentials: true})
      .then(res => {
        this.tracksTrackTab = this.objectToArray(res.data.data);
    });

  }

}
