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

  validEmail(email:string):Boolean {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  private async login(login:string, password:string):Promise<void> {
    $('#loginbtn').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
    var ret;
    var msg;
    if (login.trim().length < 3 || password.trim().length < 3) {
      $('#alert').removeClass('d-none');
      $('#alertmsg').html('Invalid fields!');
      $('#loginbtn').html('Log In');
    } else {
      try {
        await axios({url: `${environment.backEndUrl}/login`, method: 'post', data: {username: login, password: password}, withCredentials: true})
              .then(res => {
                  ret = res.data.statut;
                  msg = res.data.msg;
                  if (this.cookieService.get('token')) {
                    this.cookie = this.cookieService.get('token');
                  }
                  if (ret != 200) {
                    $('#alert').removeClass('d-none');
                    $('#alertmsg').html("The password or the username is incorrect!");
                    $('#loginbtn').html('Log In');
                  } else {
                    console.log('success login');
                  }
              });
      }
      catch (err) {
        console.error(err);
      }
    }
  }

}
