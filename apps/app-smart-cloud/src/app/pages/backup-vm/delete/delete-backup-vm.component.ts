import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'one-portal-delete-backup-vm',
  templateUrl: './delete-backup-vm.component.html',
  styleUrls: ['./delete-backup-vm.component.less'],
})
export class DeleteBackupVmComponent {
  @Input() region: number
  @Input() project: number
  @Input() idBackup: number
  @Input() backupName: string
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()

  isVisible: boolean = false
  isLoading: boolean = false

  showModal(){
    this.isVisible = true
  }

  handleCancel(): void {
    this.isVisible = false
    this.onCancel.emit();
  }

  handleOk(): void {
    this.onOk.emit();
  }
}
