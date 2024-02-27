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

@Component({
  selector: 'one-portal-instances-btn',
  templateUrl: './instances-btn.component.html',
  styleUrls: ['./instances-btn.component.less'],
})
export class InstancesBtnComponent implements OnInit, OnChanges {
  @Input() instancesId: any;
  @Output() valueChanged = new EventEmitter();

  instancesModel: InstancesModel = new InstancesModel();
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

  showModalDelete() {
    this.isVisibleDelete = true;
    this.inputConfirm = '';
  }

  handleOk() {
    this.isVisibleDelete = false;
    if (this.inputConfirm == this.instancesModel.name) {
      this.dataService.delete(this.instancesId).subscribe({
        next: (data: any) => {
          console.log(data);
          this.route.navigate(['/app-smart-cloud/instances']);
          this.notification.success('Thành công', 'Xóa máy ảo thành công');
        },
        error: (e) => {
          this.notification.error('Thất bại', 'Xóa máy ảo thất bại');
        },
      });
    } else {
      this.notification.error('Tên máy ảo không khớp', 'Xóa máy ảo thất bại');
    }
  }

  handleCancel() {
    this.isVisibleDelete = false;
  }

  continue(): void {
    //gia hạn
    this.route.navigate([
      '/app-smart-cloud/instances/instances-extend/' + this.instancesId,
    ]);
  }

  resetPassword: string = '';
  resetPasswordRepeat: string = '';
  check = true;
  isOk = false;
  passwordVisible = false;
  passwordRepeatVisible = false;

  isVisibleResetPass = false;
  modalResetPassword() {
    this.isVisibleResetPass = true;
  }

  handleCancelResetPassword() {
    this.isVisibleResetPass = false;
  }

  handleOkResetPassword() {
    if (this.resetPassword == this.resetPasswordRepeat && this.isOk) {
      this.notification.success('', 'Reset mật khẩu máy ảo thành công');
      // this.dataService
      //   .resetpassword({ id: this.instancesId, newPassword: this.resetPassword })
      //   .subscribe(
      //     (data: any) => {
      //       console.log("reset password", data);
      //       if (data == true) {
      //         this.notification.success('', 'Reset mật khẩu máy ảo thành công');
      //       } else {
      //         this.notification.error('', 'Reset mật khẩu không thành công');
      //       }
      //     },
      //     () => {
      //       this.notification.error('', 'Reset mật khẩu không thành công');
      //     }
      //   );
    } else {
      this.notification.error('', 'Reset mật khẩu không thành công');
    }
  }

  onInputChange(event: Event): void {
    if (this.resetPassword == this.resetPasswordRepeat) {
      this.check = true;
    } else {
      this.check = false;
      this.isOk = false;
    }
    if (
      this.resetPassword == this.resetPasswordRepeat &&
      this.resetPasswordRepeat != ''
    ) {
      this.isOk = true;
    } else {
      this.isOk = false;
    }
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
        },
        error: (e) => {
          this.notification.error('', 'Tắt máy ảo không thành công');
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
        },
        error: (e) => {
          this.notification.error('', 'Khởi động lại máy ảo không thành công');
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
