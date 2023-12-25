import {HttpContext} from '@angular/common/http';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ALLOW_ANONYMOUS} from '@delon/auth';
import {_HttpClient} from '@delon/theme';
import {MatchControl} from '@delon/util/form';
import {NzSafeAny} from 'ng-zorro-antd/core/types';
import {finalize} from 'rxjs';
import {environment} from "../../../../../../app-smart-cloud/src/environments/environment";
import {NzNotificationService} from "ng-zorro-antd/notification";

export interface UserCreateDto {
  email: string;
  password: any;
  accountType: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  province: string;
  address: string;
  channelSaleId: number;
  taxCode: string;
  birthDay: Date;
  haveIdentity: boolean;
}

@Component({
  selector: 'passport-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRegisterComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: _HttpClient,
    private cdr: ChangeDetectorRef,
    private notification: NzNotificationService
  ) {
  }

  panel = {
    active: false,
    name: 'Thêm thông tin cá nhân',
    disabled: false
  }
  // #region fields

  form = this.fb.nonNullable.group(
    {
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), UserRegisterComponent.checkPassword.bind(this)]],
      confirm: ['', [Validators.required, Validators.minLength(6)]],
      // mobilePrefix: ['+86'],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      mobile: ['', [Validators.pattern(/^0\d{8,10}$/)]],
      province: ['', [Validators.required]],
      agreement: ['', [Validators.required]]
    },
    {
      validators: MatchControl('password', 'confirm')
    }
  );
  error = '';
  type = 0;
  loading = false;
  visible = false;
  status = 'pool';
  progress = 0;
  passwordProgressMap: { [key: string]: 'success' | 'normal' | 'exception' } = {
    ok: 'success',
    pass: 'normal',
    pool: 'exception'
  };

  // #endregion

  // #region get captcha

  count = 0;
  interval$: NzSafeAny;

  ngOnInit(): void {
    this.form.controls.province.setValue('Hà Nội');
  }


  static checkPassword(control: FormControl): NzSafeAny {
    if (!control) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: NzSafeAny = this;
    self.visible = !!control.value;
    if (control.value && control.value.length > 9 && control.value.length < 21) {
      self.status = 'ok';
    } else if (control.value && control.value.length > 6 && control.value.length < 21) {
      self.status = 'pass';
    } else {
      self.status = 'pool';
    }

    if (self.visible) {
      self.progress = control.value.length * 10 > 100 ? 100 : control.value.length * 10;
    }
  }

  // getCaptcha(): void {
  //   const { mobile } = this.form.controls;
  //   if (mobile.invalid) {
  //     mobile.markAsDirty({ onlySelf: true });
  //     mobile.updateValueAndValidity({ onlySelf: true });
  //     return;
  //   }
  //   this.count = 59;
  //   this.cdr.detectChanges();
  //   this.interval$ = setInterval(() => {
  //     this.count -= 1;
  //     this.cdr.detectChanges();
  //     if (this.count <= 0) {
  //       clearInterval(this.interval$);
  //     }
  //   }, 1000);
  // }

  // #endregion

  submit(): void {
    this.error = '';
    Object.keys(this.form.controls).forEach(key => {
      const control = (this.form.controls as NzSafeAny)[key] as AbstractControl;
      control.markAsDirty();
      control.updateValueAndValidity();
    });
    this.visible = false;
    if (this.form.invalid) {
      return;
    }

    const data: UserCreateDto = {
      email: this.form.controls.mail.value,
      password: this.form.controls.password.value,
      accountType: 1,
      firstName: this.form.controls.firstName.value,
      lastName: this.form.controls.lastName.value,
      phoneNumber: this.form.controls.mobile.value,
      province: this.form.controls.province.value,
      address: '',
      channelSaleId: 0,
      taxCode: '',
      birthDay: new Date(),
      haveIdentity: false
    };


    this.loading = true;
    this.cdr.detectChanges();

    let baseUrl = environment['baseUrl'];
    this.http
      .post(`${baseUrl}/users`, data, null, {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.router.navigate(['passport', 'register-result'], {queryParams: {email: data.email}});
      }, error => {
        this.notification.error('Tạo tài khoản thất bại!', `Xin vui lòng thử lại sau.`);
      });
  }

  ngOnDestroy(): void {
    if (this.interval$) {
      clearInterval(this.interval$);
    }
  }
}
