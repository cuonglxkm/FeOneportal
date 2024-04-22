import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'one-portal-cancel-file-storage-normal',
  templateUrl: './cancel-file-storage-normal.component.html',
  styleUrls: ['./cancel-file-storage-normal.component.less'],
})
export class CancelFileStorageNormalComponent {
  @Input() region: number
  @Input() project: number
  @Input() idFileStorage: number
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  constructor() {
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOk();
    }
  }

  showModal(){
    this.isVisible = true
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit()
  }

  handleOk() {
    this.isLoading = true
  }
}
