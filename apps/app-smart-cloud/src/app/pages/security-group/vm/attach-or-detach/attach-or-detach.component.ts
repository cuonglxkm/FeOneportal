import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'one-portal-attach-or-detach',
  templateUrl: './attach-or-detach.component.html',
  styleUrls: ['./attach-or-detach.component.less'],
})
export class AttachOrDetachComponent {
  @Input() isVisible: boolean
  @Input() title: string
  @Input() content: string
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()

  isConfirmLoading = false;
  handleCancel(): void {
    this.onCancel.emit();
  }

  handleOk(): void {
    this.onOk.emit();
  }
}
