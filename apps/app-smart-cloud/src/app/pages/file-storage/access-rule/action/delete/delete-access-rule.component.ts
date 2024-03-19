import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { IpFloatingService } from '../../../../../shared/services/ip-floating.service';
import { AccessRuleService } from '../../../../../shared/services/access-rule.service';

@Component({
  selector: 'one-portal-delete-access-rule',
  templateUrl: './delete-access-rule.component.html',
  styleUrls: ['./delete-access-rule.component.less'],
})
export class DeleteAccessRuleComponent {
  @Input() region; number
  @Input() project: number
  @Input() shareRuleId: string
  @Input() shareCloudId: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false


  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private accessRuleService: AccessRuleService,
              private fb: NonNullableFormBuilder) {
  }

  showModal(){
    this.isVisible = true
    this.isLoading =  false
  }

  handleCancel(){
    this.isVisible = false
    this.isLoading =  false
    this.onCancel.emit()
  }

  handleOk() {
    this.accessRuleService.deleteAccessRule(this.shareRuleId, this.region, this.project, this.shareCloudId).subscribe(data => {
      if(data) {
        this.isVisible = false
        this.isLoading = false
        this.notification.success('Thành công', 'Xóa Access Rule thành công')
        this.onOk.emit()
      } else {
        this.isVisible = false
        this.isLoading = false
        this.notification.error('Thất bại', 'Xóa Access Rule thất bại')
      }
    }, error => {
      this.isVisible = false
      this.isLoading = false
      this.notification.error('Thất bại', 'Xóa Access Rule thất bại')
    })
  }
}
