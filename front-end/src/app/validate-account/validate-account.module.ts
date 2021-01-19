import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ValidateAccountPageRoutingModule } from './validate-account-routing.module';

import { ValidateAccountPage } from './validate-account.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ValidateAccountPageRoutingModule
  ],
  declarations: [ValidateAccountPage]
})
export class ValidateAccountPageModule {}
