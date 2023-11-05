import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UserProfileComponent} from "./user-profile/user-profile.component";
import {V1Component} from "./test/v1.component";
import {G2MiniBarModule} from "@delon/chart/mini-bar";
import {PagesRoutingModule} from "./pages-routing.module";



@NgModule({
  declarations: [UserProfileComponent, V1Component],
  imports: [
    CommonModule,
    G2MiniBarModule,
    PagesRoutingModule
  ]
})
export class PagesModule {

}
