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
    if (!this.cookie) {
      this.router.navigateByUrl('/login');
      $('#homepage').remove();
    } else {
    axios({url: `${environment.backEndUrl}/api/users/valid-token`, method: 'get', withCredentials: true})
      .then(res => {
      })
      .catch(err => {
          this.router.navigateByUrl('/login');
          $('#homepage').remove();
      })
    }
  }

  ngOnInit() {
  }
}
