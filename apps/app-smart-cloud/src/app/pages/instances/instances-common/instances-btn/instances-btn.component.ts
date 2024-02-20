import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { InstancesService } from '../../instances.service';
import { tr } from 'date-fns/locale';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-instances-btn',
  templateUrl: './instances-btn.component.html',
  styleUrls: ['./instances-btn.component.less'],
})
export class InstancesBtnComponent implements OnInit, OnChanges {
  selectedProject: any;
  @Input() instancesId: any;
  @Output() valueChanged = new EventEmitter();

  isVisibleDelete: boolean = false;

  constructor(
    private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private route: Router,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {}

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
  }

  handleOk() {
    this.dataService.delete(this.instancesId).subscribe(
      (data: any) => {
        console.log(data);
        this.isVisibleDelete = false;
        this.route.navigate(['/app-smart-cloud/instances']);
        this.notification.success('Thành công', 'Xóa máy ảo thành công');
      },
      () => {
        this.isVisibleDelete = false;
        this.notification.error('Thất bại', 'Xóa máy ảo thất bại');
      }
    );
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

  shutdownInstance(): void {
    this.modalSrv.create({
      nzTitle: 'Tắt máy ảo',
      nzContent: 'Quý khách chắn chắn muốn thực hiện tắt máy ảo?',
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        var body = {
          command: 'shutdown',
          id: this.instancesId,
        };
        this.dataService.postAction(body).subscribe({
          next: (data) => {
            this.notification.success('', 'Tắt máy ảo thành công');
          },
          error: (e) => {
            this.notification.error('', 'Tắt máy ảo không thành công');
          },
        });
      },
    });
  }
  restartInstance(): void {
    this.modalSrv.create({
      nzTitle: 'Khởi động lại máy ảo',
      nzContent: 'Quý khách chắc chắn muốn thực hiện khởi động lại máy ảo?',
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        var body = {
          command: 'restart',
          id: this.instancesId,
        };
        this.dataService.postAction(body).subscribe({
          next: (data) => {
            this.notification.success('', 'Khởi động lại máy ảo thành công');
          },
          error: (e) => {
            this.notification.error(
              '',
              'Khởi động lại máy ảo không thành công'
            );
          },
        });
      },
    });
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
