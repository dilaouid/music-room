import { Component, OnInit } from '@angular/core';
import { CookieService }      from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment }        from './../../environments/environment';
import axios from 'axios';

declare var $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  private cookie: string;
  constructor(private router: Router, private route: ActivatedRoute, private cookieService: CookieService) { }

  ngOnInit() {
  }

  inputLog(login:string, password:string)
  {
    if (login.length > 3 && password.length > 5) {
      $('#loginbtn').removeAttr('disabled');
    } else {
      $('#loginbtn').attr('disabled', 'disabled');
    }
  }

  private async login(login:string, password:string):Promise<void> {
    $('#loginbtn').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
    var ret;
    var msg;
    var alert;
    if (login.trim().length < 3 || password.trim().length < 3) {
      $('#alert').removeClass('d-none');
      $('#alertmsg').html('Invalid fields!');
      $('#loginbtn').html('Log In');
    } else {
      try {
        await axios({url: `${environment.backEndUrl}/authenticate/login`, method: 'post', data: {username: login, password: password}, withCredentials: true})
              .then(res => {
                  ret = res.data.statut;
                  msg = res.data.msg;
                  alert = res.data.alert;
                  if (this.cookieService.get('token')) {
                    this.cookie = this.cookieService.get('token');
                  }
                  if (ret != 200) {
                    $('#alert').removeClass('d-none', 'alert-danger', 'alert-info');
                    $('#alert').addClass(`alert-${alert}`);
                    $('#alertmsg').html(msg);
                    $('#loginbtn').html('Log In');
                  } else {
                    /* REDIRECT AFTER LOGIN */
                    console.log('success login');
                    this.router.navigateByUrl('/');
                  }
              });
      }
      catch (err) {
        console.error(err);
      }
    }
  }
}