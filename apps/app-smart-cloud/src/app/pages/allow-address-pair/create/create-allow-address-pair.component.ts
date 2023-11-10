import { Component } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'one-portal-create-allow-address-pair',
  templateUrl: './create-allow-address-pair.component.html',
  styleUrls: ['./create-allow-address-pair.component.less'],
})
export class CreateAllowAddressPairComponent {

  isVisibleCreate = false;
  isCreateLoading = false;

  validateForm: FormGroup<{
    ipAddress: FormControl<string | null>;
  }>;

  value?: string;


  handleCancel(): void {
    this.isVisibleCreate = false;
  }
  handleCreate(){
    this.isCreateLoading = true;
    this.submitForm();
    setTimeout(() => {
      this.isVisibleCreate = false;
      this.isCreateLoading = false;
    }, 3000);
  }



  submitForm(): void {
    if (this.validateForm.valid) {
      console.log('submit', this.validateForm.value);
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

}
