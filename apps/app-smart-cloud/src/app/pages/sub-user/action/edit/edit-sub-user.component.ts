import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { FormUpdateSubUser } from '../../../../shared/models/sub-user.model';
import { SubUserService } from '../../../../shared/services/sub-user.service';

@Component({
  selector: 'one-portal-edit-sub-user',
  templateUrl: './edit-sub-user.component.html',
  styleUrls: ['./edit-sub-user.component.less'],
})
export class EditSubUserComponent {
  @Input() region: number
  @Input() project: number
  @Input() idSubUser: string
  @Input() uid: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isLoading: boolean = false
  isVisible: boolean = false

  validateForm: FormGroup<{
    access: FormControl<string>
  }> = this.fb.group({
    access: ['', [Validators.required]]
  })

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private subUserService: SubUserService) {
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
    let formUpdate = new FormUpdateSubUser()
    formUpdate.uid = this.uid
    formUpdate.subuser = this.idSubUser
    if(this.validateForm.controls.access.value.includes('none')) {
      this.validateForm.controls.access.setValue('')
    } else {
      this.validateForm.controls.access.setValue('full')
    }
    this.subUserService.updateSubUser(formUpdate).subscribe(data => {
      if(data) {
        this.isLoading = false
        this.notification.success('Thành công', 'Cập nhật thông tin Sub-User thành công')
        this.onOk.emit()
      } else {
        this.isLoading = false
        this.notification.error('Thất bại', 'Cập nhật thông tin Sub-User thất bại')
        this.onOk.emit()
      }
    }, error => {
      this.isLoading = false
      this.notification.error('Thất bại', 'Cập nhật thông tin Sub-User thất bại')
    })
  }
}
