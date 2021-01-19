import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { environment }            from './../../environments/environment';
import axios from 'axios';

declare var $: any;

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  public days;
  public months;
  public years;
  constructor(private router: Router, private route: ActivatedRoute) {
    this.days    = Array.from({length:31},(v,k)=>k+1);
    this.months  = Array.from({length:12},(v,k)=>k+1);
    this.years   = Array.from({length:65},(v,k)=>k+1940);
  }

  private validEmail(email:string):Boolean {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  private inputLog(login:string, password:string, confirm_password:string, email:string)
  {
    if (login.length > 3 && password.length > 5 && confirm_password == password && this.validEmail(email) ) {
      $('#registerBtn').removeAttr('disabled');
    } else {
      $('#registerBtn').attr('disabled', 'disabled');
    }
  }

  private async register(login:string, password:string, confirm_password:string, email:string, dd:number, mm:number, yy:number):Promise<void> {
    const formatDate = `${dd}/${mm}/${yy}`;
    $('#registerBtn').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
    var ret;
    var msg;
    var alert;
    try {
      await axios({url: `${environment.backEndUrl}/authenticate/register`, method: 'post', data: {username: login, password: password, email: email, birthday:formatDate, confirm_password: confirm_password}})
            .then(res => {
                ret = res.data.statut;
                msg = res.data.msg;
                alert = res.data.alert;
                if (ret != 200) {
                  $('#alert').removeClass('d-none');
                  $('#alert').addClass(`alert-${alert}`);
                  $('#alertmsg').html(msg);
                  $('#registerBtn').html('Join 10H !');
                } else {
                  $('#registerBtn').html('Join 10H !');
                  $('#alert').removeClass('d-none', 'alert-danger', 'alert-info');
                  $('#alert').addClass(`alert-${alert}`);
                  $('#alertmsg').html(msg);
                }
            });
    }
    catch (err) {
      console.error(err);
    }
  }

  ngOnInit() {
  }

}
