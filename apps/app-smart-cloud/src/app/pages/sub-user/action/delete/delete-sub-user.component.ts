import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SubUserService } from '../../../../shared/services/sub-user.service';
import { FormDeleteSubUser, FormUpdateSubUser } from '../../../../shared/models/sub-user.model';

@Component({
  selector: 'one-portal-delete-sub-user',
  templateUrl: './delete-sub-user.component.html',
  styleUrls: ['./delete-sub-user.component.less'],
})
export class DeleteSubUserComponent {
  @Input() region: number
  @Input() project: number
  @Input() uid: string
  @Input() idSubUser: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isLoading: boolean = false
  isVisible: boolean = false

  value: string

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private subUserService: SubUserService) {
  }

  showModal() {
    this.isVisible = true
  }

  onInput(value) {
    this.value = value
  }


  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit()
  }


  handleOk() {
    this.isLoading = true
    let formDelete = new FormDeleteSubUser()
    formDelete.uid = this.uid
    formDelete.subuser = this.idSubUser
    formDelete.purge_data = true
    this.subUserService.deleteSubUser(formDelete).subscribe(data => {
      if(data) {
        this.isLoading = false
        this.notification.success('Thành công', 'Xoá thông tin Sub-User thành công')
        this.onOk.emit()
      } else {
        this.isLoading = false
        this.notification.error('Thất bại', 'Xoá thông tin Sub-User thất bại')
        this.onOk.emit()
      }
    }, error => {
      this.isLoading = false
      this.notification.error('Thất bại', 'Xoá thông tin Sub-User thất bại')
    })
  }
}
