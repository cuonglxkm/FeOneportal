import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'one-portal-detach-wan',
  templateUrl: './detach-wan.component.html',
  styleUrls: ['./detach-wan.component.less'],
})
export class DetachWanComponent {
  @Input() region: number
  @Input() project: number
  @Input() idWan: number
  @Input() addressWan: string
  @Input() instance: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isLoading: boolean = false
  isVisible: boolean = false

  constructor() {
  }

  showModalDetach() {
    this.isVisible = true
  }

  handleCancelDetach() {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit()
  }

  handleOkDetach() {

  }
}
