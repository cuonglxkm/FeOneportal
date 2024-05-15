import { NgModule } from '@angular/core';
import { NZ_ICONS, NzIconModule } from 'ng-zorro-antd/icon';

import {
  MenuFoldOutline,
  MenuUnfoldOutline,
  FormOutline,
  DashboardOutline,
  PlayCircleOutline,
  FilePdfOutline,
  LeftOutline,
  ShopOutline,
  PlusOutline,
  SearchOutline,
  WarningOutline,
  SyncOutline
} from '@ant-design/icons-angular/icons';

const icons = [
  MenuFoldOutline,
  MenuUnfoldOutline,
  DashboardOutline,
  FormOutline,
  PlayCircleOutline,
  FilePdfOutline,
  ShopOutline,
  LeftOutline,
  PlusOutline,
  SearchOutline,
  WarningOutline,
  SyncOutline
];

@NgModule({
  imports: [NzIconModule],
  exports: [NzIconModule],
  providers: [{ provide: NZ_ICONS, useValue: icons }],
})
export class IconsProviderModule {}
