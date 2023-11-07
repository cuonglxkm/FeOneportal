import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AppValidator} from "../../shared/utils/AppValidator";


@Component({
  selector: 'one-portal-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.less'],
})
export class UserProfileComponent {

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, AppValidator.cannotContainSpecialCharactor]
    }),
    surname: new FormControl('', {validators: [Validators.required, AppValidator.cannotContainSpecialCharactor]}),
    email: new FormControl('', {validators: [Validators.required, Validators.email]}),
    phone: new FormControl('', {validators: [Validators.required]}),
    customer_code: new FormControl('', {validators: [Validators.required]}),
    contract_code: new FormControl('', {validators: [Validators.required]}),
    province: new FormControl('', {validators: [Validators.required]}),
    address: new FormControl('', {validators: [Validators.required, AppValidator.cannotContainSpecialCharactorExceptComma]}),
    old_password: new FormControl('', {validators: []}),
    new_password: new FormControl('', {validators: []}),
    retype_new_password: new FormControl('', {validators: []}),
  });

  submitForm(): void {
    console.log("submitForm")
  }
}
