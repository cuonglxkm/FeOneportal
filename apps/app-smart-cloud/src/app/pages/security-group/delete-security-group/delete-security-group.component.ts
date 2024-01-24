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
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()

  isVisible: boolean = false;
  isLoading = false;
  constructor(
      private securityGroupService: SecurityGroupService,
      private message: NzMessageService,
      private notification: NzNotificationService
  ) {}


  showModal(): void {
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
    this.onCancel.emit();
  }


  handleOk(): void {
    this.isLoading = true;
    this.securityGroupService.delete(this.id, this.condition)
        .subscribe((data) => {
          this.notification.success('Thành công', `Đã xóa thành công`);
          this.isLoading = false;
          this.isVisible = false;
          this.onOk.emit();

        }, error => {
          this.isVisible = false;
          this.notification.error('Thất bại', `Đã xóa thất bại do Security Group đang được sử dụng.`);
        })


  }
}
