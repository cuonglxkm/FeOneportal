import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";

import {HttpClient, HttpContext, HttpHeaders} from "@angular/common/http";
import {ALLOW_ANONYMOUS, DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {AppValidator, UserModel} from "../../../../../../libs/common-utils/src";
import {_HttpClient} from "@delon/theme";
import {NzMessageService} from "ng-zorro-antd/message";


@Component({
  selector: 'one-portal-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.less'],
})
export class UserProfileComponent implements OnInit {
  constructor(public http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              public message: NzMessageService) {
  }

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, AppValidator.cannotContainSpecialCharactor]
    }),
    surname: new FormControl('', {validators: [Validators.required, AppValidator.cannotContainSpecialCharactor]}),
    email: new FormControl({value: '', disabled: true}),
    phone: new FormControl('', {validators: [Validators.required, AppValidator.validPhoneNumber]}),
    customer_code: new FormControl({value: '', disabled: true}),
    contract_code: new FormControl({value: '', disabled: true}),
    province: new FormControl('', {validators: [Validators.required]}),
    address: new FormControl('', {validators: [Validators.required, AppValidator.cannotContainSpecialCharactorExceptComma]}),
    old_password: new FormControl('', {validators: []}),
    new_password: new FormControl('', {validators: [AppValidator.validPassword]}),
    retype_new_password: new FormControl('', {validators: []}),
  });

  userModel: UserModel = {};

  submitForm(): void {
    console.log("submitForm")
    this.updateProfile()
  }

  ngOnInit(): void {
    // this.form.controls['customer_code'].disable();
    // this.form.controls['contract_code'].disable();
    // this.form.controls['email'].disable();
    this.loadUserProfile()
  }

  loadUserProfile() {
    // @ts-ignore
    let email = this.tokenService.get()['email'];
    this.http.get<UserModel>(`http://172.16.68.200:1006/users/${email}`, {
      context: new HttpContext()
        .set(ALLOW_ANONYMOUS, true)
    })
      .subscribe(res => {

        this.userModel = res;

        this.form.patchValue({
          name: res.name,
          surname: res.familyName,
          email: res.email,
          phone: res.phoneNumber,
          customer_code: res.userCode,
          contract_code: res.contractCode,
          province: res.province,
          address: res.address,
        })
      }, error => {
        console.log(error)
      })
  }

  updateProfile() {
    let updatedUser = {
      id: this.userModel.id,
      email: this.form.controls['email'].value!,
      firstName: this.form.controls['surname'].value!,
      lastName: this.form.controls['name'].value!,
      phoneNumber: this.form.controls['phone'].value!,
      province: this.form.controls['province'].value!,
      address: this.form.controls['address'].value!,
      birthDay: "2023-11-10T07:42:22.355Z",
    }

    this.http.put(`http://172.16.68.200:1006/users`, updatedUser, {
      context: new HttpContext().set(ALLOW_ANONYMOUS, true)
    }).subscribe(res => {
      console.log(res)
      this.message.success("Cập nhật tài khoản thành công!")
    }, error => {
      console.log(error)
      this.message.error("Cập nhật tài khoản thất bại!")
    })
  }
}
