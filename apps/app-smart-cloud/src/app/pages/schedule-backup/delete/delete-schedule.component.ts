import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'one-portal-delete-schedule',
  templateUrl: './delete-schedule.component.html',
  styleUrls: ['./delete-schedule.component.less'],
})
export class DeleteScheduleComponent {
  @Input() isVisible: boolean
  @Input() isLoading: boolean
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()

  handleCancel(): void {
    this.isVisible = false
    this.onCancel.emit();
  }

  handleOk(): void {
    this.onOk.emit();
  }
}
