import {Component, EventEmitter, Input, Output} from '@angular/core';
import {UserGroupService} from "../../../../../shared/services/user-group.service";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {FormDeleteOneUserGroup} from "../../../../../shared/models/user-group.model";

@Component({
  selector: 'one-portal-delete-one-user-group',
  templateUrl: './delete-one-user-group.component.html',
  styleUrls: ['./delete-one-user-group.component.less'],
})
export class DeleteOneUserGroupComponent {
  @Input() nameGroup: string
  @Input() isVisible: boolean
  @Input() isLoading: boolean
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()

  value: string

  constructor(private userGroupService: UserGroupService,
              private notification: NzNotificationService) {
  }
  handleCancel(): void {
    this.isVisible = false
    this.onCancel.emit();
  }

  handleOk(): void {
    this.isLoading = true
    if(this.value === this.nameGroup) {
      this.userGroupService.deleteOne(this.nameGroup).subscribe(data => {
        this.notification.success('Thành công', 'Xóa User Group ' + this.nameGroup + ' thành công')
        this.isLoading = false
        this.onOk.emit();
      }, error => {
        this.notification.error('Thất bại', 'Xóa User Group ' + this.nameGroup + ' thất bại')
      })
    } else {
      this.isLoading = false
      this.notification.error('Thất bại', 'Không thể xóa User Group ' + this.nameGroup)
    }

  }

  onInputChange() {
    console.log('input change', this.value)
  }
}
