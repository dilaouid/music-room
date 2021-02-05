import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlaylistsPageRoutingModule } from './playlists-routing.module';

import { PlaylistsPage } from './playlists.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlaylistsPageRoutingModule
  ],
  declarations: [PlaylistsPage]
})
export class PlaylistsPageModule {}
