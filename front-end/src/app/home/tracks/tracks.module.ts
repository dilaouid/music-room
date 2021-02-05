import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TracksPageRoutingModule } from './tracks-routing.module';

import { TracksPage } from './tracks.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TracksPageRoutingModule
  ],
  declarations: [TracksPage]
})
export class TracksPageModule {}
