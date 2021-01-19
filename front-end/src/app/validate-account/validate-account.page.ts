import { Component, OnInit }      from '@angular/core';
import { CookieService }          from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment }            from './../../environments/environment';
import axios from 'axios';

declare var $: any;

@Component({
  selector: 'app-validate-account',
  templateUrl: './validate-account.page.html',
  styleUrls: ['./validate-account.page.scss'],
})
export class ValidateAccountPage implements OnInit {

  hashtoken: string;

  constructor(private route: ActivatedRoute, private router: Router) { 
      this.route.queryParams.subscribe(params => {
          this.hashtoken = params['token'];
      });
  }

  async ngOnInit() {
    if (this.hashtoken.length > 10) {
      try {
        await axios({url: `${environment.backEndUrl}/authenticate/validate/${this.hashtoken}`, method: 'get', withCredentials: true})
              .then(res => {
                  $('#result').html(res.data.msg);
                  this.router.navigate(['login']);
              });
      }
      catch (err) {
        console.error(err);
      }
    }
  }

}
