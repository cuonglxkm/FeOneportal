import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../../shared/services/vlan.service';

@Component({
  selector: 'one-portal-delete-subnet',
  templateUrl: './delete-subnet.component.html',
  styleUrls: ['./delete-subnet.component.less'],
})
export class DeleteSubnetComponent {
  @Input() region: number
  @Input() project: number
  @Input() id: number
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisibleDeleteSubnet: boolean = false
  isLoadingDeleteSubnet: boolean = false

  value: string

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private vlanService: VlanService) {
  }

  onInputChange(value) {
    this.value = value
  }

  showModalDeleteSubnet() {
    this.isVisibleDeleteSubnet = true
  }

  handleCancelDeleteSubnet() {
    this.isVisibleDeleteSubnet = false
    this.isLoadingDeleteSubnet = false
    this.onCancel.emit()
  }

  handleOkDeleteSubnet() {
    this.vlanService.getSubnetById(this.id).subscribe(data => {
      if(this.value.includes(data.name)) {
        this.isLoadingDeleteSubnet = true
        this.vlanService.deleteSubnet(this.id).subscribe(item => {
          this.isVisibleDeleteSubnet = false
          this.isLoadingDeleteSubnet = false
          this.notification.success('Thành công', 'Xoá subnet thành công')
        }, error => {
          this.isVisibleDeleteSubnet = false
          this.isLoadingDeleteSubnet = false
          this.notification.error('Thất bại', 'Xoá subnet thất bại')
        })
      }
    })
  }
}
