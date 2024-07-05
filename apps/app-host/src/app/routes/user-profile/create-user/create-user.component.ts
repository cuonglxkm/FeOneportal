import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AppValidator, ProvinceModel } from '../../../../../../../libs/common-utils/src';
import { environment } from '@env/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { noAllWhitespace } from '../user-profile.component';
import { MatchControl } from '@delon/util/form';
import { finalize } from 'rxjs';

export class FormCreate {
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
  token: string | null | undefined;
  isUserBss: boolean;
}

@Component({
  selector: 'one-portal-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.less']
})
export class CreateUserComponent implements AfterViewInit {
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;

  form = this.fb.nonNullable.group(
    {
      mail: ['', [Validators.required, Validators.email]],
      firstName: ['', {
        validators: [
          Validators.required,
          AppValidator.cannotContainSpecialCharactor,
          noAllWhitespace()
        ]
      }],
      lastName: ['', {
        validators: [
          Validators.required,
          AppValidator.cannotContainSpecialCharactor,
          noAllWhitespace()
        ]
      }],
      mobile: ['', [Validators.required, AppValidator.validPhoneNumber]],
      province: ['Hà Nội', [Validators.required]]
    }
  );

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenService.get()?.token
    })
  };
  provinceList: ProvinceModel[] = [];

  @ViewChild('inputName') inputName!: ElementRef<HTMLInputElement>;

  constructor(private notification: NzNotificationService,
              public http: HttpClient,
              private fb: FormBuilder,
              private cdr: ChangeDetectorRef,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  ngAfterViewInit(): void {
    this.inputName?.nativeElement.focus();
  }

  showModal() {
    this.isVisible = true;
    this.isLoading = false;
    this.getProvinces();
    setTimeout(() => {
      this.inputName?.nativeElement.focus();
    }, 1000);
  }

  handleOk() {
    this.isLoading = true;
    console.log('submit register');
    if (this.form.invalid) {
      this.isLoading = false;
      return;
    }
    let data = new FormCreate();
    data.email = this.form.controls.mail.value.toLowerCase();
    data.password = 'Cloud@#2024';
    data.accountType = 1;
    data.firstName = this.form.controls.firstName.value;
    data.lastName = this.form.controls.lastName.value;
    data.phoneNumber = this.form.controls.mobile.value;
    data.province = this.form.controls.province.value;
    data.address = '';
    data.channelSaleId = 0;
    data.taxCode = '';
    data.birthDay = new Date();
    data.haveIdentity = false;
    data.token = this.tokenService.get()?.token;
    data.isUserBss = true;

    this.cdr.detectChanges();
    let baseUrl = environment['baseUrl'];
    this.http.post(`${baseUrl}/users/bss`, data).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe(data => {
      this.isVisible = false;
      this.isLoading = false;
      this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('form.account.create.new.success'));
    }, error => {
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi(''));
    });
    this.onOk.emit();
  }

  handleCancel() {
    this.isLoading = false;
    this.isVisible = false;
    this.onCancel.emit();
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOk();
    }
  }

  getProvinces() {
    const baseUrl = environment['baseUrl'];
    this.http
      .get<any>(`${baseUrl}/users/provinces`, {
        headers: this.httpOptions.headers
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
        }
      });
  }

}
