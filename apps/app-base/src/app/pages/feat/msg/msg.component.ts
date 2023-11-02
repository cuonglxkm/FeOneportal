import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, TemplateRef } from '@angular/core';

import { DestroyService } from '@core/services/common/destory.service';
import { PageHeaderType } from '@app/core/models/interfaces/page';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';

type msgType = 'info' | 'success' | 'warning' | 'loading' | 'error';
type confirmType = 'confirm' | 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'app-button',
  templateUrl: './msg.component.html',
  styleUrls: ['./msg.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class MsgComponent implements OnInit {
  map = {
    info: 'exclamation-circle',
    warning: 'exclamation-circle',
    success: 'check',
    error: 'close',
    confirm: 'confirm'
  };

  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Message',
    breadcrumb: ['Home', 'Features', 'Message'],
    desc: 'This is the function of the good-hearted PR'
  };

  constructor(private cdr: ChangeDetectorRef, private destroy$: DestroyService, private message: NzMessageService, private modal: NzModalService, private notification: NzNotificationService) {}

  msg(type: msgType) {
    this.message[type](`${type} message`);
  }

  modalShow(confirm: confirmType, modal: confirmType) {
    this.modal[confirm]({
      nzTitle: `This is a ${modal} message`,
      nzContent: `<p>${modal} messages</p>`,
      nzOnOk: () => console.log('Info OK'),
      nzOnCancel: () => console.log('Info cancel'),
      nzIconType: this.map[modal]
    });
  }

  createBasicNotification(template: TemplateRef<{}>): void {
    this.notification.template(template);
  }

  ngOnInit(): void {}
}
