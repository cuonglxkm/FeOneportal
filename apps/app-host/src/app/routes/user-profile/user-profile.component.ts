import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { ALLOW_ANONYMOUS, DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import {
  AppValidator,
  UserModel,
} from '../../../../../../libs/common-utils/src';
import { _HttpClient, ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18NService } from '@core';
import { environment } from '@env/environment';

@Component({
  selector: 'one-portal-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.less'],
})
export class UserProfileComponent implements OnInit {
  constructor(
    public http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    public notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  form = new FormGroup({
    name: new FormControl('', {
      validators: [
        Validators.required,
        AppValidator.cannotContainSpecialCharactor,
        noAllWhitespace(),
      ],
    }),
    surname: new FormControl('', {
      validators: [
        Validators.required,
        AppValidator.cannotContainSpecialCharactor,
        noAllWhitespace(),
      ],
    }),
    email: new FormControl({ value: '', disabled: true }),
    phone: new FormControl('', {
      validators: [Validators.required, AppValidator.validPhoneNumber],
    }),
    customer_code: new FormControl({ value: '', disabled: true }),
    contract_code: new FormControl({ value: '', disabled: true }),
    province: new FormControl('', { validators: [Validators.required] }),
    address: new FormControl('', {
      // validators: [
      //   Validators.required,
      //   AppValidator.cannotContainSpecialCharactorExceptComma,
      //   noAllWhitespace(),
      // ],
    }),
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

  userModel: UserModel = {};

  submitForm(): void {
    console.log('submitForm');
    this.updateProfile();
  }

  ngOnInit(): void {
    // this.form.controls['customer_code'].disable();
    // this.form.controls['contract_code'].disable();
    // this.form.controls['email'].disable();
    this.loadUserProfile();
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      user_root_id: this.tokenService.get()?.userId,
      Authorization: 'Bearer ' + this.tokenService.get()?.token,
    }),
  };

  loadUserProfile() {
    // @ts-ignore
    let email = this.tokenService.get()['email'];

    const baseUrl = environment['baseUrl'];
    this.http
      .get<UserModel>(`${baseUrl}/users/${email}`, {
        headers: this.httpOptions.headers,
      })
      .subscribe(
        (res) => {
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
          });
        },
        (error) => {
          console.log(error);
        }
      );
  }

  updateProfile() {
    const baseUrl = environment['baseUrl'];
    let updatedUser = {
      id: this.userModel.id,
      email: this.form.controls['email'].value!,
      firstName: this.form.controls['name'].value!.trim(),
      lastName: this.form.controls['surname'].value!.trim(),
      phoneNumber: this.form.controls['phone'].value!,
      province: this.form.controls['province'].value!,
      address: this.form.controls['address'].value!.trim(),
      birthDay: this.userModel.birthday,
    };
    if (
      updatedUser.firstName == ' ' ||
      updatedUser.lastName == ' ' ||
      updatedUser.phoneNumber == ' ' ||
      updatedUser.address == ' ' ||
      updatedUser.province == ' '
    ) {
      this.notification.error(
        this.i18n.fanyi('app.status.fail'),
        this.i18n.fanyi('app.account.validation')
      );
      return;
    }
    this.http
      .put(`${baseUrl}/users`, updatedUser, {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true),
        headers: this.httpOptions.headers,
      })
      .subscribe({
        next: (res) => {
          console.log(res);
          this.loadUserProfile();
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.account.form.success')
          );
        },
        error: (error) => {
          console.log(error);
          this.notification.error(
            error.statusText,
            this.i18n.fanyi('app.account.form.fail')
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
  onNewPassChange(data: any) {}

  onRetypePassChange(data: any) {}

  provinceList: string[] = [
    'Hà Nội',
    'Thành phố Hồ Chí Minh',
    'An Giang',
    'Bà Rịa - Vũng Tàu',
    'Bắc Giang',
    'Bắc Kạn',
    'Bạc Liêu',
    'Bắc Ninh',
    'Bến Tre',
    'Bình Định',
    'Bình Dương',
    'Bình Phước',
    'Bình Thuận',
    'Cà Mau',
    'Cao Bằng',
    'Cần Thơ',
    'Đà Nẵng',
    'Đắk Lắk',
    'Đắk Nông',
    'Điện Biên',
    'Đồng Nai',
    'Đồng Tháp',
    'Gia Lai',
    'Hà Giang',
    'Hà Nam',
    'Hà Tĩnh',
    'Hải Dương',
    'Hải Phòng',
    'Hậu Giang',
    'Hòa Bình',
    'Hưng Yên',
    'Khánh Hòa',
    'Kiên Giang',
    'Kon Tum',
    'Lai Châu',
    'Lâm Đồng',
    'Lạng Sơn',
    'Lào Cai',
    'Long An',
    'Nam Định',
    'Nghệ An',
    'Ninh Bình',
    'Ninh Thuận',
    'Phú Thọ',
    'Phú Yên',
    'Quảng Bình',
    'Quảng Nam',
    'Quảng Ngãi',
    'Quảng Ninh',
    'Quảng Trị',
    'Sóc Trăng',
    'Sơn La',
    'Tây Ninh',
    'Thái Bình',
    'Thái Nguyên',
    'Thanh Hóa',
    'Thừa Thiên Huế',
    'Tiền Giang',
    'Trà Vinh',
    'Tuyên Quang',
    'Vĩnh Long',
    'Vĩnh Phúc',
    'Yên Bái',
  ];
}

export function noAllWhitespace(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value: string = control.value;
    if (value && value.trim() == '') {
      return { allWhitespace: true };
    }
    return null;
  };
}
