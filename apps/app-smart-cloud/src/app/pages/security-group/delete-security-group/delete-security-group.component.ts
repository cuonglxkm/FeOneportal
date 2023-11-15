import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SecurityGroupSearchCondition} from "../../../shared/models/security-group";
import {SecurityGroupService} from "../../../shared/services/security-group.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {NzNotificationService} from "ng-zorro-antd/notification";

@Component({
  selector: 'one-portal-delete-security-group',
  templateUrl: './delete-security-group.component.html',
  styleUrls: ['./delete-security-group.component.less'],
})
export class DeleteSecurityGroupComponent {
  @Input() id: string
  @Input() condition: SecurityGroupSearchCondition
  @Input() isVisible: boolean
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()

  isConfirmLoading = false;

  constructor(private securityGroupService: SecurityGroupService, private message: NzMessageService,
              private notification: NzNotificationService) {}



  handleCancel(): void {
    this.onCancel.emit();
  }

  handleOk(): void {
    // this.isConfirmLoading = true;
    this.securityGroupService.delete(this.id, this.condition)
        .subscribe((data) => {
          this.notification.success('Thành công', `Đã xóa thành công`);
          this.onOk.emit();
        })
  }
}
