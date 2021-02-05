import { Component, OnInit } from '@angular/core';

import { CookieService }      from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment }        from './../../environments/environment';
import axios from 'axios';

declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  private cookie;

  constructor(private cookieService: CookieService, private route: ActivatedRoute, private router: Router) {
    this.cookie = this.cookieService.get('token');
    axios({url: `${environment.backEndUrl}/api/users/valid-token`, method: 'get', withCredentials: true})
      .catch(err => {
          this.router.navigateByUrl('/login');
          $('#homepage').remove();
      });
  }

  ngOnInit() {
  }

  public goToEvents()
  {
    $('#events').removeClass('d-none');
    $('#profile').hasClass('d-none') ? '' : $('#profile').addClass('d-none');
    $('#tracks').hasClass('d-none') ? '' : $('#tracks').addClass('d-none');
    $('#playlists').hasClass('d-none') ? '' : $('#playlists').addClass('d-none');
  }

  public goToTracks()
  {
    $('#events').hasClass('d-none') ? '' : $('#events').addClass('d-none');
    $('#profile').hasClass('d-none') ? '' : $('#profile').addClass('d-none');
    $('#tracks').removeClass('d-none');
    $('#playlists').hasClass('d-none') ? '' : $('#playlists').addClass('d-none');
  }

  public goToProfile()
  {
    $('#events').hasClass('d-none') ? '' : $('#events').addClass('d-none');
    $('#profile').removeClass('d-none');
    $('#tracks').hasClass('d-none') ? '' : $('#tracks').addClass('d-none');
    $('#playlists').hasClass('d-none') ? '' : $('#playlists').addClass('d-none');
  }

  public goToPlaylists()
  {
    $('#events').hasClass('d-none') ? '' : $('#events').addClass('d-none');
    $('#profile').hasClass('d-none') ? '' : $('#profile').addClass('d-none');
    $('#tracks').hasClass('d-none') ? '' : $('#tracks').addClass('d-none');
    $('#playlists').removeClass('d-none');
  }
}
