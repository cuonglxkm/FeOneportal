import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";

import {HttpClient, HttpHeaders} from "@angular/common/http";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {AppValidator} from "../../../../../../libs/common-utils/src";


@Component({
  selector: 'one-portal-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.less'],
})
export class UserProfileComponent implements OnInit {
  constructor(private httpClient: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
  }

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, AppValidator.cannotContainSpecialCharactor]
    }),
    surname: new FormControl('', {validators: [Validators.required, AppValidator.cannotContainSpecialCharactor]}),
    email: new FormControl('', {validators: [Validators.required, Validators.email]}),
    phone: new FormControl('', {validators: [Validators.required, AppValidator.validPhoneNumber]}),
    customer_code: new FormControl('', {validators: [Validators.required]}),
    contract_code: new FormControl('', {validators: [Validators.required]}),
    province: new FormControl('', {validators: [Validators.required]}),
    address: new FormControl('', {validators: [Validators.required, AppValidator.cannotContainSpecialCharactorExceptComma]}),
    old_password: new FormControl('', {validators: []}),
    new_password: new FormControl('', {validators: [AppValidator.validPassword]}),
    retype_new_password: new FormControl('', {validators: []}),
  });

  submitForm(): void {
    console.log("submitForm")
  }

  ngOnInit(): void {
  }
}
