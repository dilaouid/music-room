import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ValidateAccountPage } from './validate-account.page';

const routes: Routes = [
  {
    path: '',
    component: ValidateAccountPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ValidateAccountPageRoutingModule {}
