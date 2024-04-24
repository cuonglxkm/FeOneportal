import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  AppValidator,
  UserModel,
} from '../../../../../../../libs/common-utils/src';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { ALLOW_ANONYMOUS, DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { environment } from '@env/environment';

@Component({
  selector: 'one-portal-reset-password',
  template: ` <div *nzModalTitle>Đổi mật khẩu</div>
    <form nz-form [formGroup]="form" [nzLayout]="'vertical'">
      <nz-form-item>
        <nz-form-label
          >Mật khẩu cũ (<span class="text-red">*</span>)</nz-form-label
        >
        <nz-form-control nzErrorTip="Vui lòng nhập mật khẩu cũ">
          <input
            type="password"
            (change)="onOldPassChange($event)"
            nz-input
            formControlName="old_password"
            placeholder="Mật khẩu cũ"
            nzSize="large"
          />
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <nz-form-label
          >Mật khẩu mới (<span class="text-red">*</span>)</nz-form-label
        >
        <nz-form-control
          nzErrorTip="Mật khẩu có 8-16 ký tự, gồm ít nhất 1 chữ viết thường, 1 chữ viết hoa, 1 ký tự đặc biệt, 1 chữ số, không trùng mật khẩu cũ"
        >
          <input
            type="password"
            (ngModelChange)="updateConfirmValidator()"
            minlength="8"
            maxlength="16"
            nz-input
            formControlName="new_password"
            placeholder="Mật khẩu mới"
            nzSize="large"
          />
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <nz-form-label
          >Xác nhận mật khẩu (<span class="text-red">*</span>)</nz-form-label
        >
        <nz-form-control nzErrorTip="Mật khẩu không khớp!">
          <input
            type="password"
            nz-input
            (change)="onRetypePassChange($event)"
            formControlName="confirm_password"
            placeholder="Xác nhận mật khẩu"
            nzSize="large"
          />
        </nz-form-control>
      </nz-form-item>
    </form>
    <div *nzModalFooter>
      <button nz-button (click)="handleCancelResetPassword()">
        <img
          style="padding-right: 10px; margin-top: -4px"
          src="assets/imgs/cancel.svg"
          alt=""
        />Hủy
      </button>
      <button nz-button nzType="primary" (click)="handleOkResetPassword()">
        <img
          style="padding-right: 10px; margin-top: -4px"
          src="assets/imgs/confirm.svg"
          alt=""
        />Xác nhận
      </button>
    </div>`,
})
export class ModalResetPassComponent implements OnInit {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      user_root_id: this.tokenService.get()?.userId,
      Authorization: 'Bearer ' + this.tokenService.get()?.token,
    }),
  };

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private http: HttpClient,
    private modalRef: NzModalRef,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  userModel: UserModel = new UserModel();
  loadUserProfile() {
    // @ts-ignore
    let email = this.tokenService.get()['email'];

    const baseUrl = environment['baseUrl'];
    this.http.get<UserModel>(`${baseUrl}/users/${email}`, {}).subscribe({
      next: (res) => {
        this.userModel = res;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  form = new FormGroup({
    old_password: new FormControl('', { validators: [] }),
    new_password: new FormControl({ value: '', disabled: true }),
    confirm_password: new FormControl({ value: '', disabled: true }),
  });

  confirmationValidator: ValidatorFn = (
    control: AbstractControl
  ): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.form.controls['new_password'].value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  handleCancelResetPassword() {
    this.modalRef.close();
  }

  handleOkResetPassword() {
    this.modalRef.close();
    const baseUrl = environment['baseUrl'];
    const updatedUser = {
      id: this.userModel.id,
      email: this.userModel.email,
      currentPassword: this.form.controls['old_password'].value!,
      newPassword: this.form.controls['new_password'].value!,
      firstName: this.userModel.name,
      lastName: this.userModel.familyName,
      phoneNumber: this.userModel.phoneNumber,
      province: this.userModel.province,
      address: this.userModel.address,
      birthDay: this.userModel.birthday,
    };

    this.http
      .put(`${baseUrl}/users`, updatedUser, {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true),
        headers: this.httpOptions.headers
      })
      .subscribe({
        next: (res) => {
          console.log(res);
          this.notification.success('', 'Đổi mật khẩu thành công!');
        },
        error: (error) => {
          console.log(error);
          this.notification.error(
            error.statusText,
            'Đổi mật khẩu không thành công!'
          );
        },
      });
  }

  onOldPassChange(data: any) {
    console.log(data);
    this.form.controls['old_password'].setValidators([
      Validators.required,
      AppValidator.validPassword,
    ]);
    this.form.controls['old_password'].updateValueAndValidity();

    this.form.controls['new_password'].enable();
    this.form.controls['new_password'].setValidators([
      Validators.required,
      AppValidator.validPassword,
    ]);
    this.form.controls['new_password'].updateValueAndValidity();

    this.form.controls['confirm_password'].enable();
    this.form.controls['confirm_password'].setValidators([
      Validators.required,
      this.confirmationValidator,
    ]);
    this.form.controls['confirm_password'].updateValueAndValidity();
  }

  updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() =>
      this.form.controls['confirm_password'].updateValueAndValidity()
    );
  }

  onNewPassChange(data: any) {}

  onRetypePassChange(data: any) {}
}
