import { ChangeDetectorRef, Component, Inject, Input, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { InstancesService } from '../../instances.service';

@Component({
  selector: 'one-portal-instances-vlan-gim',
  templateUrl: './instances-vlan-gim.component.html',
  styleUrls: [],
})
export class InstancesVlanGimComponent implements OnInit{
  @ViewChild('operationTpl', { static: true }) operationTpl!: TemplateRef<any>;

  @Input() title?: string;
  listVLAN: [{ id: ''; text: 'Chọn VLAN' }];
  constructor(private modal: NzModalRef, private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    public message: NzMessageService,) {}
  ngOnInit(): void {
  }

  destroyModal(): void {
    this.modal.close({ data: 'this the result data' });
  }
  // shutdownInstance(): void {
  //   this.dataService.postAction(this.actionData.id, body).subscribe(
  //     (data: any) => {
  //       if (data == true) {
  //         this.message.success('Tắt máy ảo thành công');
  //       } else {
  //         this.message.error('Tắt máy ảo không thành công');
  //       }
  //     },
  //     () => {
  //       this.message.error('Tắt máy ảo không thành công');
  //     }
  //   );
  // }
}
