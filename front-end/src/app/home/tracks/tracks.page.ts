import { Component, OnInit, ɵConsole } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { environment }            from './../../../environments/environment';
import axios from 'axios';

declare var $: any;

@Component({
  selector: 'app-tracks',
  templateUrl: './tracks.page.html',
  styleUrls: ['./tracks.page.scss'],
})
export class TracksPage implements OnInit {

  constructor() { }

  public  tracksTrackTab;

  private objectToArray = (obj => {
    var arr =[];
    for(let o in obj) {
      if (obj.hasOwnProperty(o)) {
        arr.push(obj[o]);
      }
    }
    console.log(arr);
    return arr;
  });

  ngOnInit() {
    axios({url: `${environment.backEndUrl}/api/tracks/all?limit=10`, method: 'get', withCredentials: true})
      .then(res => {
        this.tracksTrackTab = this.objectToArray(res.data.data);
      })
  }

}
