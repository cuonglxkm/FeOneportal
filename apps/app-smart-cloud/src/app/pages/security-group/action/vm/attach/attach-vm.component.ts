import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'one-portal-attach-vm',
  templateUrl: './attach-vm.component.html',
  styleUrls: ['./attach-vm.component.less'],
})
export class AttachVmComponent {
  @Input() idVm: number
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()

  isVisible: boolean = false
  isLoading: boolean = false

  showModal() {
    this.isVisible = true
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit()
  }

  handleOk() {

  }
}
