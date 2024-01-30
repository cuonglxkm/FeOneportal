import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'one-portal-create-credential',
  templateUrl: './create-credential.component.html',
  styleUrls: ['./create-credential.component.css'],
})
export class CreateCredentialComponent {
  @Output() closeFormEvent = new EventEmitter();

  validateForm: FormGroup<{
    username: FormControl<string>;
    password: FormControl<string>;
    checkPassword: FormControl<string>;
  }>;

  constructor(private fb: NonNullableFormBuilder) {
    this.validateForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      checkPassword: ['', [Validators.required]],
      
    });
  }

  cancel(e: MouseEvent){
    e.preventDefault()
    this.closeFormEvent.emit();
  }

  submitForm(){
    console.log(this.validateForm);
  }

  updateConfirmValidator(){
    //
  }
}
