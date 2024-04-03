import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SecurityGroupSearchCondition } from '../../../../../../shared/models/security-group';

@Component({
  selector: 'one-portal-create-inbound',
  templateUrl: './create-inbound.component.html',
  styleUrls: ['./create-inbound.component.less'],
})
export class CreateInboundComponent {
  @Input() disabled?: boolean
  @Input() condition: SecurityGroupSearchCondition
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false;
  isLoading: boolean = false

  showModal(): void {
    this.isVisible = true;
  }

  handleOk() {
    this.isVisible = false;
    this.onOk.emit();
  }

  handleCancel(): void {
    this.isVisible = false;
    this.isLoading = false
    this.onCancel.emit();
  }
}
