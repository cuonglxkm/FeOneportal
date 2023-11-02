import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild } from '@angular/core';

import { PageHeaderType } from '@app/core/models/interfaces/page';
import { ModalBtnStatus } from '@widget/base-modal';
import { DragService } from '@widget/biz-widget/drag/drag.service';
import { NzModalWrapService } from '@widget/modal/nz-modal-wrap.service';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

@Component({
  selector: 'app-ex-modal',
  templateUrl: './ex-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExModalComponent implements OnInit {
  @ViewChild('dragTpl', { static: true }) dragTpl!: TemplateRef<NzSafeAny>;
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Drag the Modal, the tree moves to death, and the person moves to live',
    breadcrumb: ['Home', 'Modal']
  };
  isVisible = false;
  isVisibleByDir = false;

  constructor(private dragService: DragService, private modalDragService: NzModalWrapService) {}

  handleOk(): void {
    console.log('Button ok clicked!');
    this.isVisible = false;
    this.isVisibleByDir = false;
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isVisible = false;
    this.isVisibleByDir = false;
  }

  showDailog1(): void {
    this.isVisible = true;
  }

  showDailogConfirm(): void {
    this.modalDragService.confirm({
      nzTitle: 'Confirm',
      nzContent: 'Prompt content',
      nzOnOk: () => {
        console.log('OK');
      },
      nzOnCancel: () => {
        console.log('Cancel');
      }
    });
  }

  showDailogInfo(): void {
    this.modalDragService.info({ nzTitle: 'Info', nzContent: 'Prompt content' });
  }

  showDailogSuccess(): void {
    this.modalDragService.success({ nzTitle: 'Success', nzContent: 'Prompt content' });
  }

  showDailogError(): void {
    this.modalDragService.error({ nzTitle: 'Error', nzContent: 'Prompt content' });
  }

  showDailogWarning(): void {
    this.modalDragService.warning({ nzTitle: 'Warning', nzContent: 'Prompt content' });
  }

  showDailog(): void {
    // two ways
    // this.dragService.show({nzTitle: this.dragTpl, nzMask: false,nzMaskStyle:{display:'none'},nzWrapClassName:"pointer-events-none"}).subscribe(res=>console.log(res))
    this.dragService
      .show({
        nzTitle: 'Drag title',
        nzMask: false,
        nzMaskStyle: { display: 'none' },
        nzWrapClassName: 'pointer-events-none'
      })
      .subscribe(({ modalValue, status }) => {
        if (status === ModalBtnStatus.Cancel) {
          return;
        }
        console.log(modalValue);
      });
  }

  ngOnInit(): void {}
}
