import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../../shared/services/vlan.service';

@Component({
  selector: 'one-portal-delete-port',
  templateUrl: './delete-port.component.html',
  styleUrls: ['./delete-port.component.less'],
})
export class DeletePortComponent {
  @Input() region: number
  @Input() project: number
  @Input() id: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisibleDeletePort: boolean = false
  isLoadingDeletePort: boolean = false

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private vlanService: VlanService) {
  }

  showModalDeletePort() {
    this.isVisibleDeletePort = true
    this.isLoadingDeletePort = false
  }

  handleCancelDeletePort() {
    this.isVisibleDeletePort = false
    this.isLoadingDeletePort = false
    this.onCancel.emit()
  }

  handleOkDeletePort() {
    this.vlanService.deletePort(this.id, this.region, this.project).subscribe(data => {
      console.log('delete', data)
      this.isVisibleDeletePort = false
      this.isLoadingDeletePort = false
      this.notification.success('Thành công', 'Xoá Port thành công')
      this.onOk.emit()
    }, error => {
      this.isVisibleDeletePort = false
      this.isLoadingDeletePort = false
      this.notification.error('Thất bại', 'Xoá Port thất bại')
    })
  }
}
