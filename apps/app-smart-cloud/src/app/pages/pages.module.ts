import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserProfileComponent} from "./user-profile/user-profile.component";
import {V1Component} from "./test/v1.component";
import {G2MiniBarModule} from "@delon/chart/mini-bar";
import {PagesRoutingModule} from "./pages-routing.module";
import {SHARED_ZORRO_MODULES} from "../shared/shared-zorro.module";
import {ReactiveFormsModule} from "@angular/forms";
import {VolumeComponent} from "./volume/component/list-volume/volume.component";
import {SEModule} from "@delon/abc/se";
import {SharedModule} from "@shared";
import {PopupAddVolumeComponent} from "./volume/component/popup-volume/popup-add-volume.component";
import {PopupDeleteVolumeComponent} from "./volume/component/popup-volume/popup-delete-volume.component";
import {CreateVolumeComponent} from "./volume/component/create-volume/create-volume.component";
import {DetailVolumeComponent} from "./volume/component/detail-volume/detail-volume.component";
import {PopupExtendVolumeComponent} from "./volume/component/popup-volume/popup-extend-volume.component";
import {EditVolumeComponent} from "./volume/component/edit-volume/edit-volume.component";

import { SshKeyComponent } from './ssh-key/ssh-key.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import {NzResultModule} from "ng-zorro-antd/result";
import {HeaderVolumeComponent} from "./volume/component/header-volume/header-volume.component";

@NgModule({
  declarations: [UserProfileComponent, V1Component, VolumeComponent, PopupAddVolumeComponent,
    PopupDeleteVolumeComponent, CreateVolumeComponent, DetailVolumeComponent, PopupExtendVolumeComponent,
    EditVolumeComponent,SshKeyComponent, HeaderVolumeComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    G2MiniBarModule,
    PagesRoutingModule,
    NzResultModule,
    SHARED_ZORRO_MODULES,
    SEModule,
    SharedModule,
    SharedModule,
    NzPaginationModule,
    NzResultModule,
  ]
})
export class PagesModule { }
