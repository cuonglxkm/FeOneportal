import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { LoadingService } from '@delon/abc/loading';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { filter, finalize } from 'rxjs/operators';
import {
  ChangePasswordKafkaCredential,
  CreateKafkaCredentialData,
  KafkaCredential,
  NewPasswordKafkaCredential,
} from 'src/app/core/models/kafka-credential.model';
import { KafkaCredentialsService } from 'src/app/services/kafka-credentials.service';

@Component({
  selector: 'one-portal-credential-action',
  templateUrl: './credential-action.component.html',
  styleUrls: ['./credential-action.component.css'],
})
export class CreateCredentialComponent implements OnDestroy {
  @Input() serviceOrderCode: string;
  @Output() closeFormEvent = new EventEmitter();

  showCreateCredential = 1;
  showUpdatePassword = 2;
  showForgotPassword = 3;

  usernameError: string;
  oldPasswordError: string;
  passwordError: string;
  checkPasswordError: string;

  passwordVisible: boolean;
  repasswordVisible: boolean;
  credential: KafkaCredential;
  activatedTab: number;
  credentialSubcription: Subscription;
  tabSubcription: Subscription;

  pwdTplString: string;
  confirmTplString: string;

  validateForm: FormGroup<{
    username: FormControl<string>;
    oldPassword: FormControl<string>;
    password: FormControl<string>;
    checkPassword: FormControl<string>;
  }>;

  constructor(
    private fb: NonNullableFormBuilder,
    private kafkaCredentialService: KafkaCredentialsService,
    private notification: NzNotificationService,
    private loadingSrv: LoadingService
  ) {
    this.passwordVisible = false;
    this.repasswordVisible = false;

    this.credentialSubcription =
      this.kafkaCredentialService.selectedCredential.subscribe((data) => {
        this.credential = data;
      });
    this.tabSubcription = this.kafkaCredentialService.activatedTab.subscribe(
      (tab) => {
        this.activatedTab = tab;
      }
    );

    this.pwdTplString =
      this.activatedTab !== this.showCreateCredential
        ? 'Mật khẩu mới'
        : 'Mật khẩu';
    this.confirmTplString = (() => {
      switch (this.activatedTab) {
        case this.showCreateCredential:
          return 'Tạo mới';
        case this.showUpdatePassword:
          return 'Cập nhật';
        case this.showForgotPassword:
          return 'Xác nhận';
        default:
          return null;
      }
    })();

    this.validateForm = this.fb.group({
      username: [
        {
          value:
            this.activatedTab === this.showUpdatePassword
              ? this.credential.username
              : '',
          disabled: this.activatedTab !== this.showCreateCredential,
        },
        [
          Validators.required,
          Validators.maxLength(64),
          Validators.minLength(4),
          Validators.pattern(/^[a-zA-Z0-9]+$/),
        ],
      ],
      oldPassword: [
        { value: '', disabled: this.activatedTab !== this.showUpdatePassword },
        [
          Validators.required,
          Validators.maxLength(64),
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!~`()}{[]|\/;:'"?><,.*}])(?!.*\s).+$/
          ),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.maxLength(64),
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!~`()}{[]|\/;:'"?><,.*}])(?!.*\s).+$/
          ),
          this.newPasswordValidator.bind(this),
        ],
      ],
      checkPassword: ['', [this.confirmPasswordValidator.bind(this)]],
    });
  }

  ngOnDestroy(): void {
    this.credentialSubcription.unsubscribe();
    this.tabSubcription.unsubscribe();
  }

  cancel(e: MouseEvent) {
    e.preventDefault();
    this.closeFormEvent.emit();
  }

  submitForm() {
    switch (this.activatedTab) {
      case this.showCreateCredential: {
        const createData = new CreateKafkaCredentialData(
          this.serviceOrderCode,
          this.validateForm.get('username').value,
          this.validateForm.get('password').value,
          this.validateForm.get('checkPassword').value
        );
        this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
        this.kafkaCredentialService
          .createCredential(createData)
          .pipe(
            filter((r) => r && r.code == 200),
            finalize(() => {
              this.loadingSrv.close();
            })
          )
          .subscribe(() => {
            this.closeFormEvent.emit();
            this.notification.success('Thông báo', 'Tạo tài khoản thành công', {
              nzDuration: 2000,
            });
          });
        break;
      }
      case this.showUpdatePassword: {
        const updateData = new ChangePasswordKafkaCredential(
          this.serviceOrderCode,
          this.validateForm.get('username').value,
          this.validateForm.get('oldPassword').value,
          this.validateForm.get('password').value,
          this.validateForm.get('checkPassword').value
        );
        this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
        this.kafkaCredentialService
          .updatePassword(updateData)
          .pipe(
            filter((r) => r && r.code == 200),
            finalize(() => {
              this.loadingSrv.close();
            })
          )
          .subscribe(() => {
            this.closeFormEvent.emit();
            this.notification.success('Thông báo', 'Đổi mật khẩu thành công', {
              nzDuration: 2000,
            });
          });
        break;
      }
      case this.showForgotPassword: {
        const newPasswordData = new NewPasswordKafkaCredential(
          this.serviceOrderCode,
          this.credential.username,
          this.validateForm.get('password').value,
          this.validateForm.get('checkPassword').value
        );
        this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
        this.kafkaCredentialService
          .createNewPassword(newPasswordData)
          .pipe(filter((r) => r && r.code == 200),
          finalize(() => {
            this.loadingSrv.close();
          }))
          .subscribe(() => {
            this.closeFormEvent.emit();
            this.notification.success('Thông báo', 'Đổi mật khẩu thành công', {
              nzDuration: 2000,
            });
          });
        break;
      }
    }
  }

  validateUsername() {
    const usernameControl = this.validateForm.get('username');
    if (usernameControl.hasError('required')) {
      this.usernameError = 'Tên tài khoản không được để trống';
    } else if (
      usernameControl.hasError('minlength') ||
      usernameControl.hasError('maxlength')
    ) {
      this.usernameError =
        'Tên tài khoản phải có tối thiểu 4 ký tự và tối đa 64 ký tự';
    } else if (usernameControl.hasError('pattern')) {
      this.usernameError =
        'Tên tài khoản chỉ bao gồm chữ cái thường, chữ hoa hoặc chữ số';
    }
  }

  validateOldPassword() {
    const oldPasswordControll = this.validateForm.get('oldPassword');
    if (oldPasswordControll.hasError('required')) {
      this.oldPasswordError = 'Mật khẩu cũ không được để trống';
    } else if (
      oldPasswordControll.hasError('minlength') ||
      oldPasswordControll.hasError('maxlength')
    ) {
      this.oldPasswordError =
        'Mật khẩu cũ phải có tối thiểu 8 ký tự và tối đa 64 ký tự';
    } else if (oldPasswordControll.hasError('pattern')) {
      this.oldPasswordError =
        'Mật khẩu cũ phải bao gồm chữ thường, chữ hoa, số, ký tự đặc biệt và không được chứa dấu cách';
    }

    Promise.resolve().then(() => {
      const passwordControll = this.validateForm.controls.password;
      if (
        !passwordControll.hasError('required') &&
        !passwordControll.hasError('minlength') &&
        !passwordControll.hasError('maxlength') &&
        !passwordControll.hasError('pattern')
      ) {
        passwordControll.updateValueAndValidity();
        this.validatePassword();
      }
    });
  }

  validatePassword() {
    const passwordControll = this.validateForm.get('password');
    if (passwordControll.hasError('required')) {
      this.passwordError = `${this.pwdTplString} không được để trống`;
    } else if (
      passwordControll.hasError('minlength') ||
      passwordControll.hasError('maxlength')
    ) {
      this.passwordError = `${this.pwdTplString} phải có tối thiểu 8 ký tự và tối đa 64 ký tự`;
    } else if (passwordControll.hasError('pattern')) {
      this.passwordError = `${this.pwdTplString} phải bao gồm chữ thường, chữ hoa, số, ký tự đặc biệt và không được chứa dấu cách`;
    } else if (passwordControll.hasError('matchOldPwd')) {
      this.passwordError = 'Mật khẩu mới không được trùng với mật khẩu cũ';
    }

    Promise.resolve().then(() => {
      this.validateForm.controls.checkPassword.updateValueAndValidity();
      this.validateCheckPassword();
    });
  }

  validateCheckPassword() {
    const checkPasswordControll = this.validateForm.get('checkPassword');
    if (checkPasswordControll.hasError('required')) {
      this.checkPasswordError = `Mật khẩu xác nhận không được để trống`;
    } else if (checkPasswordControll.hasError('confirmPassword')) {
      this.checkPasswordError = `Mật khẩu xác nhận không khớp`;
    }
  }

  newPasswordValidator(control: AbstractControl): ValidationErrors | null {
    if (this.activatedTab !== this.showUpdatePassword) return null;

    if (!control.value) {
      return { required: true };
    } else {
      const oldPassword = this.validateForm.controls.oldPassword;

      if (control.value === oldPassword.value) return { matchOldPwd: true };
    }
    return null;
  }

  confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return { required: true };
    } else {
      const password = this.validateForm.controls.password;

      if (control.value !== password.value) return { confirmPassword: true };
    }
    return null;
  }
}
