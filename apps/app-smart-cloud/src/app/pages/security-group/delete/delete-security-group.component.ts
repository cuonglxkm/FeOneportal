import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SecurityGroupSearchCondition} from "../../../core/model/interface/security-group";
import {SecurityGroupService} from "../../../core/service/security-group.service";
import {NzMessageService} from "ng-zorro-antd/message";

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

  constructor(private securityGroupService: SecurityGroupService, private message: NzMessageService) {}



  handleCancel(): void {
    this.onCancel.emit();
  }

  handleOk(): void {
    this.isConfirmLoading = true;
    this.securityGroupService.delete(this.id, this.condition)
        .subscribe((data) => {
          this.message.create('success', `Đã xóa thành công`);
          this.onOk.emit();
        })
  }
}
