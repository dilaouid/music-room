import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TracksPage } from './tracks.page';

const routes: Routes = [
  {
    path: '',
    component: TracksPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TracksPageRoutingModule {}
