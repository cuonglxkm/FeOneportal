import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SecurityGroupSearchCondition } from '../../../../../../shared/models/security-group';

@Component({
  selector: 'one-portal-create-outbound',
  templateUrl: './create-outbound.component.html',
  styleUrls: ['./create-outbound.component.less'],
})
export class CreateOutboundComponent {
  @Input() disabled?: boolean
  @Input() condition: SecurityGroupSearchCondition
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

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
