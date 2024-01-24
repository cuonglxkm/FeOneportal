import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'one-portal-delete-backup-vm',
  templateUrl: './delete-backup-vm.component.html',
  styleUrls: ['./delete-backup-vm.component.less'],
})
export class DeleteBackupVmComponent {
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
