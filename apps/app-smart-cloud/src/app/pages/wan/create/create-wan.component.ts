import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'one-portal-create-wan',
  templateUrl: './create-wan.component.html',
  styleUrls: ['./create-wan.component.less'],
})
export class CreateWanComponent {
  @Input() region: number
  @Input() project: number
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  validateForm: any

  constructor() {
  }

  showModalCreate() {
    this.isVisible = true
  }

  handleCancelCreate() {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit()
  }

  submitForm() {

  }

}
