import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SecurityGroupSearchCondition} from "../../../core/model/interface/security-group";
import {NzMessageService} from "ng-zorro-antd/message";
import {SecurityGroupRuleService} from "../../../core/service/security-group-rule.service";

@Component({
  selector: 'one-portal-delete-security-group-rule',
  templateUrl: './delete-rule.component.html',
  styleUrls: ['./delete-rule.component.less'],
})
export class DeleteRuleComponent {
  @Input() id: string
  @Input() condition: SecurityGroupSearchCondition
  @Input() isVisible: boolean
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()

  isConfirmLoading = false;

  constructor(private securityGroupRuleService: SecurityGroupRuleService, private message: NzMessageService) {}



  handleCancel(): void {
    this.onCancel.emit();
  }

  handleOk(): void {
    this.isConfirmLoading = true;
    this.securityGroupRuleService.delete(this.id, this.condition)
        .subscribe((data) => {
          this.message.create('success', `Đã xóa thành công`);
          this.onOk.emit();
        })
  }
}
