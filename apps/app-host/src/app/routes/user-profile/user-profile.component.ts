import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { ALLOW_ANONYMOUS, DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import {
  AppValidator,
  ProvinceModel,
  UserModel,
} from '../../../../../../libs/common-utils/src';
import {
  _HttpClient,
  ALAIN_I18N_TOKEN,
  SettingsService,
  User,
} from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18NService } from '@core';
import { environment } from '@env/environment';
import { FormUpdateUserInvoice } from '../../../../../app-smart-cloud/src/app/shared/models/invoice';
import { InvoiceService } from '../../../../../app-smart-cloud/src/app/shared/services/invoice.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

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
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private fb: NonNullableFormBuilder,
    private invoiceService: InvoiceService,
    private settings: SettingsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  get user(): User {
    return this.settings.user;
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.getProvinces();
  }
  tabSelect = 0;
  customerGroup: any;
  customerGroups: any;
  customerType: any;
  customerTypes: any;
  isLoadingUpdateInfo: any = false;
  email: string;
  isTabInvoice = true;
  formHandleUserInvoice: FormUpdateUserInvoice = new FormUpdateUserInvoice();
  userModel: UserModel = {};
  form = new FormGroup({
    name: new FormControl('', {
      validators: [
        Validators.required,
        AppValidator.cannotContainSpecialCharactor,
      ],
    }),
    surname: new FormControl('', {
      validators: [
        Validators.required,
        AppValidator.cannotContainSpecialCharactor,
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
      validators: [AppValidator.cannotContainSpecialCharactorExceptComma],
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

  formCustomerInvoice: FormGroup<{
    nameCompany: FormControl<string>;
    email: FormControl<string>;
    phoneNumber: FormControl<string>;
    nameCustomer: FormControl<string>;
    taxCode: FormControl<string>;
    address: FormControl<string>;
  }> = this.fb.group({
    nameCompany: ['', Validators.required],
    email: ['', [Validators.required, AppValidator.validEmail]],
    phoneNumber: ['', [Validators.required, AppValidator.validPhoneNumber]],
    nameCustomer: [
      '',
      [Validators.required, AppValidator.cannotContainSpecialCharactor],
    ],
    taxCode: ['', [Validators.required, Validators.pattern(/^[0-9-]+$/)]],
    address: ['', Validators.required],
  });

  selectedIndexChange(event) {
    this.tabSelect = event;

    if (this.tabSelect === 1 && this.isTabInvoice) {
      this.getUser();
      this.isTabInvoice = false;
    }
  }
  submitForm(): void {
    console.log('submitForm');
    this.updateProfile();
  }

  changeCustomerGroup(id) {
    console.log(id);

    const customerGroupFilter = this.customerGroups.filter(
      (item) => item.id === id
    );
    this.customerTypes = customerGroupFilter[0].customerTypes;
    this.customerType = this.customerTypes[0].id;
    console.log(this.customerType);

    if (this.customerType === 1) {
      this.formCustomerInvoice.controls.taxCode.setValidators([
        Validators.pattern(/^[0-9-]+$/),
      ]);
      this.formCustomerInvoice.controls.taxCode.updateValueAndValidity();
      this.formCustomerInvoice.controls.nameCompany.clearValidators();
      this.formCustomerInvoice.controls.nameCompany.updateValueAndValidity();
    } else {
      this.formCustomerInvoice.controls.taxCode.setValidators([
        Validators.required,
        Validators.pattern(/^[0-9-]+$/),
      ]);
      this.formCustomerInvoice.controls.taxCode.updateValueAndValidity();
      this.formCustomerInvoice.controls.nameCompany.setValidators([
        Validators.required,
      ]);
      this.formCustomerInvoice.controls.nameCompany.updateValueAndValidity();
    }
  }

  getUser() {
    this.email = this.tokenService.get()?.email;
    const accessToken = this.tokenService.get()?.token;

    const baseUrl = environment['baseUrl'];
    this.http
      .get<UserModel>(`${baseUrl}/users/${this.tokenService.get()?.email}`, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + accessToken,
        }),
        context: new HttpContext().set(ALLOW_ANONYMOUS, true),
      })
      .subscribe({
        next: (res) => {
          this.userModel = res;
          if (this.userModel && this.userModel.customerInvoice === null) {
            this.formCustomerInvoice.controls.email.setValue(
              this.userModel.email || ''
            );
            this.formCustomerInvoice.controls.nameCustomer.setValue(
              this.userModel.fullName || ''
            );
            this.formCustomerInvoice.controls.address.setValue(
              this.userModel.address || ''
            );
            this.formCustomerInvoice.controls.phoneNumber.setValue(
              this.userModel.phoneNumber || ''
            );
            this.getListCustomerGroup();
          } else if (
            this.userModel &&
            this.userModel.customerInvoice !== null
          ) {
            this.formCustomerInvoice.controls.email.setValue(
              this.userModel.customerInvoice.email
            );
            this.formCustomerInvoice.controls.nameCustomer.setValue(
              this.userModel.customerInvoice.fullName
            );
            this.formCustomerInvoice.controls.address.setValue(
              this.userModel.customerInvoice.address
            );
            this.formCustomerInvoice.controls.phoneNumber.setValue(
              this.userModel.customerInvoice.phoneNumber
            );
            this.formCustomerInvoice.controls.taxCode.setValue(
              this.userModel.customerInvoice.taxCode
            );
            this.formCustomerInvoice.controls.nameCompany.setValue(
              this.userModel.customerInvoice.companyName
            );
            this.getListCustomerGroup();
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  getListCustomerGroup() {
    const baseUrl = environment['baseUrl'];
    this.http
      .get<any>(`${baseUrl}/users/customer-group`, this.httpOptions)
      .subscribe({
        next: (data) => {
          if (this.userModel && this.userModel.customerInvoice !== null) {
            this.customerGroup = this.userModel.customerInvoice.customerGroupId;
            this.customerGroups = data;
            const customerGroupFilter = this.customerGroups.filter(
              (item) => item.id === this.customerGroup
            );
            this.customerTypes = customerGroupFilter[0].customerTypes;
            this.customerType = this.userModel.customerInvoice.customerTypeId;
          } else if (
            this.userModel &&
            this.userModel.customerInvoice === null
          ) {
            this.customerGroups = data;
            this.customerGroup = data[0].id;
            const customerGroupFilter = this.customerGroups.filter(
              (item) => item.id === this.customerGroup
            );
            this.customerTypes = customerGroupFilter[0].customerTypes;
            this.customerType = this.customerTypes[0].id;
          }
          if (this.customerType === 1) {
            this.formCustomerInvoice.controls.taxCode.setValidators([
              Validators.pattern(/^[0-9-]+$/),
            ]);
            this.formCustomerInvoice.controls.taxCode.updateValueAndValidity();
            this.formCustomerInvoice.controls.nameCompany.clearValidators();
            this.formCustomerInvoice.controls.nameCompany.updateValueAndValidity();
          } else {
            this.formCustomerInvoice.controls.taxCode.setValidators([
              Validators.required,
              Validators.pattern(/^[0-9-]+$/),
            ]);
            this.formCustomerInvoice.controls.taxCode.updateValueAndValidity();
            this.formCustomerInvoice.controls.nameCompany.setValidators([
              Validators.required,
            ]);
            this.formCustomerInvoice.controls.nameCompany.updateValueAndValidity();
          }
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            this.i18n.fanyi('Lấy danh sách thất bại')
          );
        },
      });
  }

  changeCustomerType(id) {
    console.log(this.customerType);

    if (id === 1 || id === 2) {
      this.formCustomerInvoice.controls.taxCode.setValidators([
        Validators.pattern(/^[0-9-]+$/),
      ]);
      this.formCustomerInvoice.controls.taxCode.updateValueAndValidity();
      this.formCustomerInvoice.controls.nameCompany.clearValidators();
      this.formCustomerInvoice.controls.nameCompany.updateValueAndValidity();
    } else {
      this.formCustomerInvoice.controls.taxCode.setValidators([
        Validators.required,
        Validators.pattern(/^[0-9-]+$/),
      ]);
      this.formCustomerInvoice.controls.taxCode.updateValueAndValidity();
      this.formCustomerInvoice.controls.nameCompany.setValidators([
        Validators.required,
      ]);
      this.formCustomerInvoice.controls.nameCompany.updateValueAndValidity();
    }
  }

  handleOkUpdateCustomerInvoice() {
    if (this.userModel && this.userModel.customerInvoice === null) {
      this.isLoadingUpdateInfo = true;
      this.formHandleUserInvoice.companyName =
        this.formCustomerInvoice.controls.nameCompany.value;
      this.formHandleUserInvoice.address =
        this.formCustomerInvoice.controls.address.value;
      this.formHandleUserInvoice.phoneNumber =
        this.formCustomerInvoice.controls.phoneNumber.value;
      this.formHandleUserInvoice.fullName =
        this.formCustomerInvoice.controls.nameCustomer.value;
      this.formHandleUserInvoice.email =
        this.formCustomerInvoice.controls.email.value;
      this.formHandleUserInvoice.taxCode =
        this.formCustomerInvoice.controls.taxCode.value;
      this.formHandleUserInvoice.customerGroupId = this.customerGroup;
      this.formHandleUserInvoice.customerTypeId = this.customerType;
      this.formHandleUserInvoice.customerId = this.tokenService.get()?.userId;
      console.log(this.formHandleUserInvoice);

      this.invoiceService.createInvoice(this.formHandleUserInvoice).subscribe({
        next: (data) => {
          this.isLoadingUpdateInfo = false;
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.invoice.pop-up.update.success')
          );
          setTimeout(() => window.location.reload(), 1000);
        },
        error: (e) => {
          this.isLoadingUpdateInfo = false;
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.invoice.pop-up.update.fail')
          );
        },
      });
    } else if (this.userModel && this.userModel.customerInvoice !== null) {
      this.isLoadingUpdateInfo = true;
      this.formHandleUserInvoice.companyName =
        this.formCustomerInvoice.controls.nameCompany.value;
      this.formHandleUserInvoice.address =
        this.formCustomerInvoice.controls.address.value;
      this.formHandleUserInvoice.phoneNumber =
        this.formCustomerInvoice.controls.phoneNumber.value;
      this.formHandleUserInvoice.fullName =
        this.formCustomerInvoice.controls.nameCustomer.value;
      this.formHandleUserInvoice.email =
        this.formCustomerInvoice.controls.email.value;
      this.formHandleUserInvoice.taxCode =
        this.formCustomerInvoice.controls.taxCode.value;
      this.formHandleUserInvoice.customerGroupId = this.customerGroup;
      this.formHandleUserInvoice.customerTypeId = this.customerType;
      this.formHandleUserInvoice.customerId = this.tokenService.get()?.userId;
      this.formHandleUserInvoice.id = this.userModel.customerInvoice.id;
      console.log(this.formHandleUserInvoice);

      this.invoiceService.updateInvoice(this.formHandleUserInvoice).subscribe({
        next: (data) => {
          this.isLoadingUpdateInfo = false;
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.invoice.pop-up.update.success')
          );
          setTimeout(() => window.location.reload(), 1000);
        },
        error: (e) => {
          this.isLoadingUpdateInfo = false;
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.invoice.pop-up.update.fail')
          );
        },
      });
    }
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Root-Id':
        localStorage?.getItem('UserRootId') &&
        Number(localStorage?.getItem('UserRootId')) > 0
          ? Number(localStorage?.getItem('UserRootId'))
          : this.tokenService?.get()?.userId,
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
            customer_code: res.customerCode,
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

  isLoadingProfile: boolean = false;
  updateProfile() {
    this.isLoadingProfile = true;
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
      .pipe(
        finalize(() => {
          this.isLoadingProfile = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          console.log(res);
          this.user.name = updatedUser.firstName;
          this.settings.setUser(this.user);
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.account.form.success')
          );
          setTimeout(() => window.location.reload(), 1000);
        },
        error: (error) => {
          this.notification.error('', error.error.message);
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

  provinceList: ProvinceModel[] = [];
  getProvinces() {
    const baseUrl = environment['baseUrl'];
    this.http
      .get<any>(`${baseUrl}/users/provinces`, {
        headers: this.httpOptions.headers,
      })
      .subscribe({
        next: (data) => {
          this.provinceList = data;
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            this.i18n.fanyi('app.notify.get.list.province')
          );
        },
      });
  }

  onSernameBlur() {
    this.form.controls['surname'].setValue(
      this.form.controls['surname'].value!.trimStart()
    );
  }

  onNameBlur() {
    this.form.controls['name'].setValue(
      this.form.controls['name'].value!.trimStart()
    );
  }
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
