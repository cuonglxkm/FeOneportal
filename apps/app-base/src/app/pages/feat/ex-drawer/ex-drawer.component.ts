import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { ExDrawerDrawerService } from '@app/drawer/biz-drawer/ex-drawer-drawer/ex-drawer-drawer.service';
import { PageHeaderType } from '@app/core/models/interfaces/page';
import { ModalBtnStatus } from '@widget/base-modal';

@Component({
  selector: 'app-ex-drawer',
  templateUrl: './ex-drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExDrawerComponent implements OnInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'ExDrawer',
    breadcrumb: ['Home', 'ExDrawer'],
    desc: 'I have many big dreams hidden in a small drawer'
  };
  data = '';
  dataFromDrawer = '';

  constructor(private drawerService: ExDrawerDrawerService, private cdr: ChangeDetectorRef) {}

  showDrawer(): void {
    this.drawerService.show({ nzTitle: 'Service Creation' }, { name: this.data }).subscribe(({ modalValue, status }) => {
      if (status === ModalBtnStatus.Cancel) {
        return;
      }
      this.dataFromDrawer = modalValue.password;
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {}
}
