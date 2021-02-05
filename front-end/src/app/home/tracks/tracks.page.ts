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

  ngOnInit() {
    axios({url: `${environment.backEndUrl}/api/tracks/all?limit=10`, method: 'get', withCredentials: true})
      .then(res => {
        this.tracksTrackTab = this.objectToArray(res.data.data);
    });
  }

}
