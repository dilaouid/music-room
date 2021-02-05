import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewEventPage } from './new-event.page';

const routes: Routes = [
  {
    path: '',
    component: NewEventPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewEventPageRoutingModule {}
