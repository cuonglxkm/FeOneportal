import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UserProfileComponent} from "./user-profile/user-profile.component";
import {V1Component} from "./test/v1.component";
import {G2MiniBarModule} from "@delon/chart/mini-bar";
import {PagesRoutingModule} from "./pages-routing.module";
import {SharedModule} from "@shared";
import { SshKeyComponent } from './ssh-key/ssh-key.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import {NzResultModule} from "ng-zorro-antd/result";

@NgModule({
  declarations: [UserProfileComponent, V1Component, SshKeyComponent],
  imports: [
    CommonModule,
    G2MiniBarModule,
    PagesRoutingModule,
    SharedModule,
    NzPaginationModule,
    NzResultModule,
  ]
})
export class PagesModule { }
