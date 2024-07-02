import { HttpContext } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, Inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ALLOW_ANONYMOUS } from '@delon/auth';
import { _HttpClient, ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { MatchControl } from '@delon/util/form';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { finalize } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { environment } from '@env/environment';
import { AppValidator } from '../../../../../../../libs/common-utils/src';
import { noAllWhitespace } from '../../user-profile/user-profile.component';
import { I18NService } from '@core';
import { DOCUMENT } from '@angular/common';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRegisterComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: _HttpClient,
    private cdr: ChangeDetectorRef,
    private notification: NzNotificationService,
    private settings: SettingsService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DOCUMENT) private doc: any,
  ) {
  }

  panel = {
    active: false,
    name: 'Thêm thông tin cá nhân',
    disabled: false,
  };
  // #region fields

  form = this.fb.nonNullable.group(
    {
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, AppValidator.validPassword]],
      confirm: ['', [Validators.required]],
      // mobilePrefix: ['+86'],
      firstName: ['', {
        validators: [
          Validators.required,
          AppValidator.cannotContainSpecialCharactor,
          noAllWhitespace(),
        ],
      }],
      lastName: ['', {
        validators: [
          Validators.required,
          AppValidator.cannotContainSpecialCharactor,
          noAllWhitespace(),
        ],
      }],
      mobile: ['', [Validators.required, AppValidator.validPhoneNumber]],
      province: ['Hà Nội', [Validators.required]],
      agreement: [true, [Validators.required]],
      recaptchaReactive: ['', [Validators.required]],
    },
    {
      validators: MatchControl('password', 'confirm'),
    }
  );
  province = 'Hà Nội'
  error = '';
  type = 0;
  loading = false;
  visible = false;
  status = 'pool';
  progress = 0;
  passwordProgressMap: { [key: string]: 'success' | 'normal' | 'exception' } = {
    ok: 'success',
    pass: 'normal',
    pool: 'exception',
  };

  // #endregion

  // #region get captcha

  count = 0;
  interval$: NzSafeAny;

  ngOnInit(): void {
    this.langRegister = localStorage.getItem('lang') == null ? this.i18n.defaultLang : localStorage.getItem('lang');
    this.loadProvinces();
  }

  public addTokenLog(message: string, token: string | null) {
    console.log(message, token);
  }
  static checkPassword(control: FormControl): NzSafeAny {
    if (!control) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: NzSafeAny = this;
    self.visible = !!control.value;
    if (
      control.value &&
      control.value.length > 9 &&
      control.value.length < 21
    ) {
      self.status = 'ok';
    } else if (
      control.value &&
      control.value.length > 7 &&
      control.value.length < 21
    ) {
      self.status = 'pass';
    } else {
      self.status = 'pool';
    }

    if (self.visible) {
      self.progress =
        control.value.length * 10 > 100 ? 100 : control.value.length * 10;
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
  passwordVisible = false;
  passwordVisible1 = false;
  langRegister: any;
  provinces: any;

  submit(): void {
    console.log('submit register')
    this.error = '';
    Object.keys(this.form.controls).forEach((key) => {
      const control = (this.form.controls as NzSafeAny)[key] as AbstractControl;
      control.markAsDirty();
      control.updateValueAndValidity();
    });
    this.visible = false;
    if (this.form.invalid) {
      return;
    }

    const data: UserCreateDto = {
      email: this.form.controls.mail.value.toLowerCase(),
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
      haveIdentity: false,
    };

    this.loading = true;
    this.cdr.detectChanges();

    let baseUrl = environment['baseUrl'];
    this.http
      .post(`${baseUrl}/users`, data, null, {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true),
      })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.router.navigate(['passport', 'register-result'], {
            queryParams: { email: data.email },
          });
        },
        error: (error) => {
          if (error?.error?.title == 'Validation errors') {
            if (error.error.validationErrors.Password != null) {
              this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.validationErrors.Password[0]);
            } else if (error.error.validationErrors.Email != null) {
              this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.validationErrors.Email[0]);
            }

          } else {
            this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.message);
          }
        },
      });
  }

  ngOnDestroy(): void {
    if (this.interval$) {
      clearInterval(this.interval$);
    }
  }


  changelang() {
    localStorage.setItem('lang',this.langRegister)
    // if (this.langRegister === 'Vietnam') {
    //
    // } else {
    //   this.i18n.loadLangData('en-US').subscribe(res => {
    //     this.i18n.use('en-US', res);
    //     this.settings.setLayout('lang', 'en-US');
    //     setTimeout(() => this.doc.location.reload());
    //   });
    // }

    this.i18n.loadLangData(this.langRegister).subscribe(res => {
      this.i18n.use(this.langRegister, res);
      this.settings.setLayout('lang', this.langRegister);
      setTimeout(() => this.doc.location.reload());
    });
  }

  private loadProvinces() {
    fetch(environment.baseUrl + '/users/provinces').then(r => r.json()).then(j => {
      this.provinces = j;
      this.form.controls.province.setValue(j[0])
      console.log(j)
    });

    // this.http.get<any>(environment.baseUrl + '/users/provinces').subscribe(
    //   data => {
    //     this.provinces = data
    //     this.form.controls.province.setValue(data[0])
    //   },
    //   error => {
    //     console.log(error)
    //   }
    // )
  }
}
