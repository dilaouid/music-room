import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewPlaylistPageRoutingModule } from './new-playlist-routing.module';

import { NewPlaylistPage } from './new-playlist.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewPlaylistPageRoutingModule
  ],
  declarations: [NewPlaylistPage]
})
export class NewPlaylistPageModule {}
