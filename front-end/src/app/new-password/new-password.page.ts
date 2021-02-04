import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment }            from './../../environments/environment';
import { NavController } from '@ionic/angular';

import axios from 'axios';

declare var $: any;

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.page.html',
  styleUrls: ['./new-password.page.scss'],
})
export class NewPasswordPage implements OnInit {
  private passtoken:string;
  public USERNAME:string;

  constructor(private route: ActivatedRoute, private router: Router, public navCtrl: NavController) {
    this.route.queryParams.subscribe(params => {
        this.passtoken = params['passtoken'];
        this.checkToken();
    });
   }

   async checkToken()
   {
    await axios({url: `${environment.backEndUrl}/authenticate/new-password/${this.passtoken}`, method: 'get'}).then(res => {
        if (res.data.res != 200) {
          this.router.navigateByUrl('/login');
          $('#newPassForm').remove()
        } else {
          this.USERNAME = res.data.username;
        }
    });
   }

  async newPass(password:string, confirm:string)
  {
    $('#btn').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
    var msg;
    if (password != confirm) {
      $('#alert').addClass(`alert-danger`);
      msg = "The passwords must be the same!";
    } else {
      await axios({url: `${environment.backEndUrl}/authenticate/new-password`, method: 'post', data: { password: password, token: this.passtoken } }).then(res => {
          $('#alert').removeClass('d-none', 'alert-success', 'alert-danger');
          $('#alert').addClass(`alert-${res.data.alert}`);
          msg = res.data.msg
      });
    }
    $('#alertmsg').html(msg);
    $('#btn').html('This is my new password !');
  }

  ngOnInit() {
  }

}
