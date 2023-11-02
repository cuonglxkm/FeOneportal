import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { PageHeaderType } from '@app/core/models/interfaces/page';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-copy',
  templateUrl: './copy.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyComponent implements OnInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Text copy example',
    breadcrumb: ['Home', 'Features', 'Clipboard']
  };
  value = '';

  constructor(private msg: NzMessageService) {}

  info(): void {
    this.msg.success('Copy successfully, paste directly');
  }

  ngOnInit(): void {}
}
