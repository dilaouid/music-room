import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TypeCodePage } from './type-code.page';

const routes: Routes = [
  {
    path: '',
    component: TypeCodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TypeCodePageRoutingModule {}
