import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'one-portal-delete-wan',
  templateUrl: './delete-wan.component.html',
  styleUrls: ['./delete-wan.component.less'],
})
export class DeleteWanComponent {
  @Input() region: number
  @Input() project: number
  @Input() idWan: number
  @Input() addressWan: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  validateForm: FormGroup<{
    ip: FormControl<string>
  }> = this.fb.group({
    ip: ['', [Validators.required]]
  });

  isLoading: boolean = false
  isVisible: boolean = false

  constructor(private fb: NonNullableFormBuilder) {
  }
  showModalDelete() {
    this.isVisible = true
  }

  handleCancelDelete() {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit()
  }

  handleOkDelete() {
    if(this.addressWan.includes(this.validateForm.controls.ip.value)){

    }
  }
}
