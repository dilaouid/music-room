import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditPlaylistPage } from './edit-playlist.page';

const routes: Routes = [
  {
    path: '',
    component: EditPlaylistPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditPlaylistPageRoutingModule {}
