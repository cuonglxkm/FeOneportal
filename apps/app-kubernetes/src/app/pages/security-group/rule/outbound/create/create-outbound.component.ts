import { SecurityGroupSearchCondition } from './../../../../../model/security-group.model';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'one-portal-create-outbound',
  templateUrl: './create-outbound.component.html',
  styleUrls: ['./create-outbound.component.less'],
})
export class CreateOutboundComponent {

  @Input() disabled?: boolean;
  @Input() condition: SecurityGroupSearchCondition;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isVisible: boolean = false;

  showModal(): void {
    this.isVisible = true;
  }

  handleOk() {
    this.isVisible = false;
    this.onOk.emit();
  }

  handleCancel(): void {
    this.isVisible = false;
    this.onCancel.emit();
  }
}
