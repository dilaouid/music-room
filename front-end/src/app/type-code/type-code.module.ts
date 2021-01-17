import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TypeCodePageRoutingModule } from './type-code-routing.module';

import { TypeCodePage } from './type-code.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TypeCodePageRoutingModule
  ],
  declarations: [TypeCodePage]
})
export class TypeCodePageModule {}
