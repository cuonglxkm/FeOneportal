import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";

@Component({
  selector: 'one-portal-edit-user-group',
  templateUrl: './edit-user-group.component.html',
  styleUrls: ['./edit-user-group.component.less'],
})
export class EditUserGroupComponent {
  @Input() isVisible: boolean
  @Input() isLoading: boolean
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()

  value: string


  validateForm: FormGroup<{
    groupName: FormControl<string>;
  }> = this.fb.group({
    groupName: ['', [Validators.required, Validators.pattern(/^[\w\d+=,.@\-_]{1,128}$/), Validators.maxLength(128)]],

  });

  constructor(private fb: NonNullableFormBuilder) {
  }
  handleCancel(): void {
    this.isVisible = false
    this.onCancel.emit();
  }

  handleOk(): void {
    if(this.value.includes('delete')){

    }
    this.onOk.emit();
  }

  onInputChange() {
    console.log('input change', this.value)
  }

  submitForm() {

  }
}
