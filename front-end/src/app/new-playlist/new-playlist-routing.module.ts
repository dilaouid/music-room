import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewPlaylistPage } from './new-playlist.page';

const routes: Routes = [
  {
    path: '',
    component: NewPlaylistPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewPlaylistPageRoutingModule {}
