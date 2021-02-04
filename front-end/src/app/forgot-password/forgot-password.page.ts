import { Component, OnInit } from '@angular/core';
import { environment }        from './../../environments/environment';
import axios from 'axios';

declare var $: any;

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  private validEmail(email:string):Boolean {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  public async forgotPass(email:string)
  { 
    var ret;
    var msg;
    var alert;
    $('#btn').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
    $('#alert').removeClass('d-none');
    if (!this.validEmail(email)) {
      $('#alertmsg').html('Invalid fields!');
      $('#alert').addClass(`alert-danger`);
      $('#btn').html('Send me a code !');
    } else {
      try {
        await axios({url: `${environment.backEndUrl}/authenticate/forgot-password`, method: 'post', data: {email: email}})
              .then(res => {
                  ret   = res.data.statut;
                  msg   = res.data.msg;
                  alert = res.data.alert;
                  $('#alert').removeClass('alert-danger');
                  $('#alert').removeClass('alert-success');
                  $('#alert').addClass(`alert-${alert}`);
                  $('#alertmsg').html(msg);
                  $('#btn').html('Send me a code !');
              });
      }
      catch (err) {
        console.error(err);
      }
    }
  }

}
