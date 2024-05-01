import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { InstancesService } from '../../instances.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { InstancesModel } from '../../instances.model';
import { LoadingService } from '@delon/abc/loading';
import { finalize } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-instances-btn',
  templateUrl: './instances-btn.component.html',
  styleUrls: ['./instances-btn.component.less'],
})
export class InstancesBtnComponent implements OnInit, OnChanges {
  @Input() instancesId: any;
  @Output() valueChanged = new EventEmitter();

  instancesModel: InstancesModel;
  isVisibleDelete: boolean = false;
  inputConfirm: string = '';

  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private dataService: InstancesService,
    private cdr: ChangeDetectorRef,
    private route: Router,
    private notification: NzNotificationService,
    private loadingSrv: LoadingService
  ) {}

  isViLanguage: boolean;
  ngOnInit(): void {
    this.isViLanguage = this.i18n.currentLang == 'vi-VI' ? true : false;
    this.dataService.getById(this.instancesId, true).subscribe((data: any) => {
      this.instancesModel = data;
      this.cdr.detectChanges();
    });
  }

  openConsole(): void {
    this.route.navigateByUrl(
      '/app-smart-cloud/instances/instances-console/' + this.instancesId,
      {
        state: {
          vmId: this.instancesId,
        },
      }
    );
  }

  titleDeleteInstance: string = '';
  checkInputConfirm: boolean = false;
  checkInputEmpty: boolean = false;
  showModalDelete() {
    this.isVisibleDelete = true;
    this.inputConfirm = '';
    if (this.isViLanguage) {
      this.titleDeleteInstance = 'Xóa máy ảo ' + this.instancesModel.name;
    } else {
      this.titleDeleteInstance =
        'Delete the ' + this.instancesModel.name + ' instance';
    }
  }

  handleOkDelete() {
    if (this.inputConfirm == this.instancesModel.name) {
      this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
      this.checkInputConfirm = false;
      this.checkInputEmpty = false;
      this.isVisibleDelete = false;
      this.dataService
        .delete(this.instancesId)
        .pipe(
          finalize(() => {
            this.loadingSrv.close();
          })
        )
        .subscribe({
          next: (data: any) => {
            this.valueChanged.emit('DELETE');
            this.notification.success('', 'Xóa máy ảo thành công');
          },
          error: (e) => {
            this.isVisibleDelete = false;
            this.notification.error(e.statusText, 'Xóa máy ảo thất bại');
          },
        });
    } else if (this.inputConfirm == '') {
      this.checkInputEmpty = true;
      this.checkInputConfirm = false;
    } else {
      this.checkInputEmpty = false;
      this.checkInputConfirm = true;
    }
    this.cdr.detectChanges();
  }

  handleCancelDelete() {
    this.isVisibleDelete = false;
    this.checkInputConfirm = false;
    this.checkInputEmpty = false;
  }

  continue(): void {
    //gia hạn
    this.route.navigate([
      '/app-smart-cloud/instances/instances-extend/' + this.instancesId,
    ]);
  }

  formPass: FormGroup;
  resetPassword: string = '';
  resetPasswordRepeat: string = '';
  check = true;
  isOk = false;
  passwordVisible = false;
  passwordRepeatVisible = false;
  autoCreate: boolean = false;
  isVisibleResetPass = false;
  modalResetPassword() {
    this.isVisibleResetPass = true;
    this.passwordVisible = false;
    this.passwordRepeatVisible = false;
    this.resetPassword = '';
    this.resetPasswordRepeat = '';
    this.formPass = new FormGroup({
      newpass: new FormControl('', {
        validators: [
          Validators.required,
          Validators.pattern(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\s]).{12,20}$/
          ),
        ],
      }),
      passRepeat: new FormControl('', {
        validators: [Validators.required],
      }),
    });
    this.check = true;
    this.isOk = false;
    this.autoCreate = false;
  }

  handleCancelResetPassword() {
    this.isVisibleResetPass = false;
  }

  handleOkResetPassword() {
    this.isVisibleResetPass = false;
    this.dataService
      .changePassword(this.instancesId, this.resetPassword)
      .subscribe({
        next: (data: any) => {
          this.notification.success('', 'Đổi mật khẩu máy ảo thành công');
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            'Đổi mật khẩu máy ảo không thành công'
          );
        },
      });
  }

  generateRandomPassword(): string {
    const length = 12; // Độ dài tối thiểu 12 ký tự
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numericChars = "0123456789";
    const specialChars = "!@#$%^&*()_+-=[]{}|;'\"\\:,.<>?`~/"
  
    let password = '';
  
    // Chọn ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt
    password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    password += numericChars[Math.floor(Math.random() * numericChars.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
  
    // Tạo các ký tự còn lại
    const remainingChars = length - 4; // 4 là số lượng ký tự đã được chọn ở trên
    const allChars = uppercaseChars + lowercaseChars + numericChars + specialChars;
    for (let i = 0; i < remainingChars; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
  
    // Trộn ngẫu nhiên chuỗi mật khẩu
    password = password.split('').sort(() => Math.random() - 0.5).join('');
  
    return password;
  }

  changeAutoCreate() {
    if (this.autoCreate) {
      this.resetPassword = this.generateRandomPassword();
      this.resetPasswordRepeat = this.resetPassword;
      this.passwordVisible = true;
      this.passwordRepeatVisible = true;
    } else {
      this.resetPassword = '';
      this.resetPasswordRepeat = '';
    }
  }

  onInputChange(event: Event): void {
    if (this.resetPassword == this.resetPasswordRepeat) {
      this.check = true;
    } else if (this.resetPasswordRepeat == '') {
      this.check = true;
    } else {
      this.check = false;
    }
  }

  isVisibleStart: boolean = false;
  showModalStart() {
    this.isVisibleStart = true;
  }
  handleOkStart() {
    this.isVisibleStart = false;
    var body = {
      command: 'start',
      id: this.instancesId,
    };
    this.dataService.postAction(body).subscribe({
      next: (data: any) => {
        if (data == 'Thao tác thành công') {
          this.notification.success('', 'Bật máy ảo thành công');
          this.valueChanged.emit(data);
        } else {
          this.notification.error('', 'Bật máy ảo không thành công');
        }
      },
      error: (e) => {
        this.notification.error(e.statusText, 'Bật máy ảo không thành công');
      },
    });
  }
  handleCancelStart() {
    this.isVisibleStart = false;
  }

  isVisibleShutdown: boolean = false;
  showModalShutdown() {
    this.isVisibleShutdown = true;
  }
  handleOkShutdown() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.isVisibleShutdown = false;
    var body = {
      command: 'shutdown',
      id: this.instancesId,
    };
    this.dataService
      .postAction(body)
      .pipe(
        finalize(() => {
          this.loadingSrv.close();
        })
      )
      .subscribe({
        next: (data) => {
          this.notification.success('', 'Tắt máy ảo thành công');
          this.valueChanged.emit(data);
        },
        error: (e) => {
          this.notification.error(e.statusText, 'Tắt máy ảo không thành công');
        },
      });
  }
  handleCancelShutdown() {
    this.isVisibleShutdown = false;
  }

  isVisibleRestart: boolean = false;
  showModalRestart() {
    this.isVisibleRestart = true;
  }
  handleOkRestart() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.isVisibleRestart = false;
    var body = {
      command: 'restart',
      id: this.instancesId,
    };
    this.dataService
      .postAction(body)
      .pipe(
        finalize(() => {
          this.loadingSrv.close();
        })
      )
      .subscribe({
        next: (data) => {
          this.notification.success('', 'Khởi động lại máy ảo thành công');
          this.valueChanged.emit('REBOOT');
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            'Khởi động lại máy ảo không thành công'
          );
        },
      });
  }
  handleCancelRestart() {
    this.isVisibleRestart = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
    }
  }
  navigateToCreate() {
    this.route.navigate(['/app-smart-cloud/instances/instances-create']);
  }
  navigateToChangeImage() {
    this.route.navigate([
      '/app-smart-cloud/instances/instances-edit-info/' + this.instancesId,
    ]);
  }
  navigateToEdit() {
    this.route.navigate([
      '/app-smart-cloud/instances/instances-edit/' + this.instancesId,
    ]);
  }
  returnPage(): void {
    this.route.navigate(['/app-smart-cloud/instances']);
  }
}
