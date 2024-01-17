import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { InstancesService } from '../../instances.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-instances-vlan-gim',
  templateUrl: './instances-vlan-gim.component.html',
  styleUrls: [],
})
export class InstancesVlanGimComponent implements OnInit {
  @ViewChild('operationTpl', { static: true }) operationTpl!: TemplateRef<any>;

  @Input() title?: string;
  listVLAN: [{ id: ''; text: 'Chọn VLAN' }];
  constructor(
    private modal: NzModalRef,
    private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private notification: NzNotificationService
  ) {}
  ngOnInit(): void {}

  destroyModal(): void {
    this.modal.close({ data: 'this the result data' });
  }
  // shutdownInstance(): void {
  //   this.dataService.postAction(this.actionData.id, body).subscribe(
  //     (data: any) => {
  //       if (data == true) {
  //         this.notification.success('', 'Tắt máy ảo thành công');
  //       } else {
  //         this.notification.error('', 'Tắt máy ảo không thành công');
  //       }
  //     },
  //     () => {
  //       this.notification.error('', 'Tắt máy ảo không thành công');
  //     }
  //   );
  // }
}
