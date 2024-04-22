import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { ExecuteAttachOrDetach } from '../../../../../shared/models/security-group';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SecurityGroupService } from '../../../../../shared/services/security-group.service';

@Component({
  selector: 'one-portal-attach-vm',
  templateUrl: './attach-vm.component.html',
  styleUrls: ['./attach-vm.component.less'],
})
export class AttachVmComponent {
  @Input() idVm: number
  @Input() securityGroupId: string
  @Input() region: number
  @Input() project: number
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()

  isVisible: boolean = false
  isLoading: boolean = false

  constructor( @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
               private notification: NzNotificationService,
               private securityGroupService: SecurityGroupService) {
  }

  showModal() {
    this.isVisible = true
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit()
  }

  handleOk() {
    this.isLoading = true
    let attachOrDetachForm = new ExecuteAttachOrDetach()
    attachOrDetachForm.securityGroupId = this.securityGroupId
    attachOrDetachForm.instanceId = this.idVm
    attachOrDetachForm.action = 'attach'
    attachOrDetachForm.userId = this.tokenService.get()?.userId
    attachOrDetachForm.regionId = this.region
    attachOrDetachForm.projectId = this.project
    this.securityGroupService.attachOrDetach(attachOrDetachForm).subscribe(data => {
      this.isLoading = false
      this.isVisible = false
      this.notification.success('Thành công', 'Gắn Security Group vào máy ảo thành công')
      this.onOk.emit()
    }, error => {
      this.isLoading = false
      this.isVisible = false
      this.notification.error('Thất bại', 'Gắn Security Group vào máy ảo thất bại, ' + error.error.detail)
    })
  }
}
