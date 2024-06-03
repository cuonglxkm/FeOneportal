import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'one-portal-attach-ip-floating-lb',
  templateUrl: './attach-ip-floating-lb.component.html',
  styleUrls: ['./attach-ip-floating-lb.component.less'],
})
export class AttachIpFloatingLbComponent {
  @Input() region: number
  @Input() project: number
  @Input() IsFloatingIP: boolean
  @Input() ipFloatingAddress: string
  @Input() vipIp: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  constructor() {
  }

  showModal() {
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
