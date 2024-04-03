import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { InstancesService } from '../../instances.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { InstancesModel } from '../../instances.model';
import { LoadingService } from '@delon/abc/loading';
import { finalize } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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
    private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private route: Router,
    private notification: NzNotificationService,
    private loadingSrv: LoadingService
  ) {}

  ngOnInit(): void {
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

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  titleDeleteInstance: string = '';
  showModalDelete() {
    this.isVisibleDelete = true;
    this.inputConfirm = '';
    this.titleDeleteInstance = 'Xóa máy ảo ' + this.instancesModel.name;
  }

  handleOkDelete() {
    if (this.inputConfirm == this.instancesModel.name) {
      this.isVisibleDelete = false;
      this.dataService.delete(this.instancesId).subscribe({
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
      this.notification.error('Vui lòng nhập tên máy ảo', '');
    } else {
      this.isVisibleDelete = false;
      this.notification.error(
        'Vui lòng nhập đúng tên máy ảo',
        'Xóa máy ảo thất bại'
      );
    }
  }

  handleCancelDelete() {
    this.isVisibleDelete = false;
  }

  continue(): void {
    //gia hạn
    this.route.navigate([
      '/app-smart-cloud/instances/instances-extend/' + this.instancesId,
    ]);
  }

  formPass = new FormGroup({
    newpass: new FormControl('', {
      validators: [
        Validators.required,
        Validators.pattern(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{12,}$/
        ),
      ],
    }),
    passRepeat: new FormControl('', {
      validators: [Validators.required],
    }),
  });
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
    this.resetPassword = '';
    this.resetPasswordRepeat = '';
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
      .resetpassword({
        id: this.instancesId,
        newPassword: this.resetPassword,
      })
      .subscribe({
        next: (data: any) => {
          if (data == true) {
            this.notification.success('', 'Reset mật khẩu máy ảo thành công');
          } else {
            this.notification.error(
              '',
              'Reset mật khẩu máy ảo không thành công'
            );
          }
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            'Reset mật khẩu máy không thành công'
          );
        },
      });
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
