import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SecurityGroupSearchCondition} from "../../../shared/models/security-group";
import {NzMessageService} from "ng-zorro-antd/message";
import {SecurityGroupRuleService} from "../../../shared/services/security-group-rule.service";
import {NzNotificationService} from "ng-zorro-antd/notification";

@Component({
  selector: 'one-portal-delete-security-group-rule',
  templateUrl: './delete-rule.component.html',
  styleUrls: ['./delete-rule.component.less'],
})
export class DeleteRuleComponent {
  @Input() id: string
  @Input() condition: SecurityGroupSearchCondition
  @Input() isVisible: boolean
  @Input() title: string
  @Input() content: string
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()

  isConfirmLoading = false;

  constructor(private securityGroupRuleService: SecurityGroupRuleService, private message: NzMessageService,
              private notification: NzNotificationService) {}

  handleCancel(): void {
    this.onCancel.emit();
  }

  handleOk(): void {
    this.isConfirmLoading = true;
    this.securityGroupRuleService.delete(this.id, this.condition)
        .subscribe((data) => {
          this.onOk.emit();
          this.notification.success('Thành công', `Đã xóa thành công`);
        }, error => {
          this.notification.error('Thất bại', `Đã xóa thất bại`);
        })
  }
}
