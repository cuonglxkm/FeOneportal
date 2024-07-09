import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
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
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { finalize } from 'rxjs';

@Component({
  selector: 'one-portal-reset-password',
  template: ` <div *nzModalTitle>
      {{ 'menu.account.reset.password' | i18n }}
    </div>
    <form nz-form [formGroup]="form" [nzLayout]="'vertical'">
      <nz-form-item>
        <nz-form-label
          >{{ 'app.password.old' | i18n }} (<span class="text-red">*</span
          >)</nz-form-label
        >
        <nz-form-control [nzErrorTip]="oldpassErrorTpl">
          <nz-input-group [nzSuffix]="suffixTemplateOld" nzSize="large">
            <input
              [type]="oldPasswordVisible ? 'text' : 'password'"
              (ngModelChange)="onOldPassChange($event)"
              minlength="8"
              maxlength="16"
              nz-input
              formControlName="old_password"
              [placeholder]="'app.enter.password.old' | i18n"
            />
          </nz-input-group>
          <div *ngIf="incorrectOldPassword">
            <span style="color: #ff4d4f">{{
              'validation.password.old.incorrect' | i18n
            }}</span>
          </div>
          <ng-template #oldpassErrorTpl let-control>
            <ng-container *ngIf="control.hasError('required')"
              >{{ 'validation.password.old.required' | i18n }}
            </ng-container>
            <ng-container *ngIf="control.hasError('validPassword')">{{
              'validation.password.account.pattern' | i18n
            }}</ng-container>
          </ng-template>
          <ng-template #suffixTemplateOld>
            <img
              style="margin-top: -4px"
              [src]="
                oldPasswordVisible
                  ? 'assets/imgs/eye-close.svg'
                  : 'assets/imgs/eye1.svg'
              "
              alt=""
              (click)="oldPasswordVisible = !oldPasswordVisible"
            />
          </ng-template>
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <nz-form-label
          >{{ 'app.password.new' | i18n }} (<span class="text-red">*</span
          >)</nz-form-label
        >
        <nz-form-control [nzErrorTip]="newpassErrorTpl">
          <nz-input-group [nzSuffix]="suffixTemplateNew" nzSize="large">
            <input
              [type]="newPasswordVisible ? 'text' : 'password'"
              (ngModelChange)="updateConfirmValidator()"
              minlength="8"
              maxlength="16"
              nz-input
              formControlName="new_password"
              [placeholder]="'app.enter.password.new' | i18n"
            />
          </nz-input-group>
          <div *ngIf="isSamePassword">
            <span style="color: #ff4d4f">{{
              'validation.password.new.match.old' | i18n
            }}</span>
          </div>
          <div *ngIf="isValidatorError">
            <span style="color: #ff4d4f">{{ messageError }}</span>
          </div>
          <ng-template #suffixTemplateNew>
            <img
              style="margin-top: -4px"
              [src]="
                newPasswordVisible
                  ? 'assets/imgs/eye-close.svg'
                  : 'assets/imgs/eye1.svg'
              "
              alt=""
              (click)="newPasswordVisible = !newPasswordVisible"
            />
          </ng-template>
        </nz-form-control>
        <ng-template #newpassErrorTpl let-control>
          <ng-container *ngIf="control.hasError('required')"
            >{{ 'validation.password.new.required' | i18n }}
          </ng-container>
          <ng-container *ngIf="control.hasError('validPassword')">{{
            'validation.password.account.pattern' | i18n
          }}</ng-container>
        </ng-template>
      </nz-form-item>
      <nz-form-item>
        <nz-form-label
          >{{ 'app.password.confirm' | i18n }} (<span class="text-red">*</span
          >)</nz-form-label
        >
        <nz-form-control [nzErrorTip]="'validation.password.confirm' | i18n">
          <nz-input-group [nzSuffix]="suffixTemplateConfirm" nzSize="large">
            <input
              [type]="confirmPasswordVisible ? 'text' : 'password'"
              nz-input
              (change)="onRetypePassChange($event)"
              minlength="8"
              maxlength="16"
              formControlName="confirm_password"
              [placeholder]="'app.password.confirm' | i18n"
            />
          </nz-input-group>
          <ng-template #suffixTemplateConfirm>
            <img
              style="margin-top: -4px"
              [src]="
                confirmPasswordVisible
                  ? 'assets/imgs/eye-close.svg'
                  : 'assets/imgs/eye1.svg'
              "
              alt=""
              (click)="confirmPasswordVisible = !confirmPasswordVisible"
            />
          </ng-template>
        </nz-form-control>
      </nz-form-item>
    </form>
    <div *nzModalFooter>
      <button nz-button (click)="handleCancelResetPassword()">
        <img
          style="padding-right: 10px; margin-top: -4px"
          src="assets/imgs/cancel.svg"
          alt=""
        />{{ 'app.button.cancel' | i18n }}
      </button>
      <button
        nz-button
        nzType="primary"
        (click)="handleOkResetPassword()"
        [nzLoading]="isLoading"
        [disabled]="form.invalid || isSamePassword"
      >
        <img
          style="padding-right: 10px; margin-top: -4px"
          src="assets/imgs/confirm.svg"
          alt=""
        />{{ 'app.button.confirm' | i18n }}
      </button>
    </div>`,
})
export class ModalResetPassComponent implements OnInit {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Root-Id': this.tokenService.get()?.userId,
      Authorization: 'Bearer ' + this.tokenService.get()?.token,
    }),
  };

  isLoading: boolean = false;
  oldPasswordVisible: boolean = false;
  newPasswordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private http: HttpClient,
    private modalRef: NzModalRef,
    private notification: NzNotificationService,
    private router: Router,
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef
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
    old_password: new FormControl('', {
      validators: [Validators.required, AppValidator.validPassword],
    }),
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

  incorrectOldPassword: boolean = false;
  isValidatorError: boolean = false;
  messageError: string = '';
  handleOkResetPassword() {
    this.isLoading = true;
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
        headers: this.httpOptions.headers,
      })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.modalRef.close();
          console.log(res);
          this.notification.success(
            '',
            this.i18n.fanyi('app.notify.reset.pass.success')
          );
          setTimeout(() => this.logout(), 5000);
        },
        error: (e) => {
          if (e.error.message == 'Incorrect password.') {
            this.incorrectOldPassword = true;
          } else {
            this.isValidatorError = true;
            this.messageError = e.error.validationErrors.NewPassword.join(", ");
          }
        },
      });
  }

  onOldPassChange(data: any) {
    console.log(data);
    this.incorrectOldPassword = false;
    if (
      this.form.controls['old_password'].value ==
        this.form.controls['new_password'].value &&
      this.form.controls['old_password'].value != ''
    ) {
      this.isSamePassword = true;
    } else {
      this.isSamePassword = false;
    }
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
    this.cdr.detectChanges();
  }

  isSamePassword: boolean = false;
  updateConfirmValidator(): void {
    this.isValidatorError = false;
    /** wait for refresh value */
    Promise.resolve().then(() =>
      this.form.controls['confirm_password'].updateValueAndValidity()
    );
    if (
      this.form.controls['old_password'].value ==
        this.form.controls['new_password'].value &&
      this.form.controls['new_password'].value != ''
    ) {
      this.isSamePassword = true;
    } else {
      this.isSamePassword = false;
    }
  }

  onNewPassChange(data: any) {}

  onRetypePassChange(data: any) {}

  logout(): void {
    let id_token = this.tokenService.get()!['id_token'];
    console.log('logout host');
    sessionStorage.clear();
    this.cookieService.deleteAll( "/",".onsmartcloud.com",true,"None");
    this.tokenService.clear();
    localStorage.removeItem('UserRootId');
    localStorage.removeItem('ShareUsers');
    localStorage.removeItem('PermissionOPA');
    localStorage.removeItem('user');
    localStorage.removeItem('_token');

    window.location.href =
      environment['sso'].issuer +
      `/connect/logout?oi_au_id=${id_token}&post_logout_redirect_uri=${decodeURIComponent(
        environment['sso'].logout_callback
      )}`;
  }
}
