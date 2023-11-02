import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { NzNoAnimationModule } from 'ng-zorro-antd/core/no-animation';

import { DefLayoutContentModule } from './def-layout-content/def-layout-content.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { NavDrawerComponent } from './nav-drawer/nav-drawer.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { TabComponent } from './tab/tab.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [AdminComponent, TabComponent, SideNavComponent, NavBarComponent, ToolBarComponent, NavDrawerComponent],
  imports: [SharedModule, DefLayoutContentModule, AdminRoutingModule, NzNoAnimationModule,TranslateModule]
})
export class AdminModule {}
