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

  constructor() { }

  ngOnInit() {
  }

}
