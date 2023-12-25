import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { InstancesService } from '../../instances.service';
import { tr } from 'date-fns/locale';

@Component({
  selector: 'one-portal-instances-btn',
  templateUrl: './instances-btn.component.html',
  styleUrls: ['./instances-btn.component.less'],
})
export class InstancesBtnComponent implements OnInit, OnChanges {
  selectedProject: any;
  @Input() instancesId: any;
  @Output() valueChanged = new EventEmitter();

  constructor(
    private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private route: Router,
    private router: ActivatedRoute,
    public message: NzMessageService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
  }

  
  openConsole(): void {
    this.route.navigateByUrl('/app-smart-cloud/instances/instances-console/' + this.instancesId, {
      state: {
        vmId: this.instancesId
      }
    });
  }

  delete(tpl: TemplateRef<{}>): void {
    //xóa
    this.modalSrv.create({
      nzTitle: 'Xóa máy ảo',
      nzContent: tpl,
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.dataService.delete(this.instancesId).subscribe(
          (data: any) => {
            console.log(data);
            if (data == true) {
              this.message.success('Xóa máy ảo thành công');
            } else {
              this.message.error('Xóa máy ảo không thành công');
            }
          },
          () => {
            this.message.error('Xóa máy ảo không thành công');
          }
        );
      },
    });
  }

  continue(tpl: TemplateRef<{}>): void {
    //gia hạn
    this.modalSrv.create({
      nzTitle: 'Gia hạn',
      nzContent: tpl,
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.message.success('Gia hạn thành công');
        //  this.dataService.delete(this.id).subscribe(
        //   (data: any) => {
        //     console.log(data);
        //     if (data == true) {
        //       this.message.success('Xóa máy ảo thành công');
        //     } else {
        //       this.message.error('Xóa máy ảo không thành công');
        //     }
        //   },
        //   () => {
        //     this.message.error('Xóa máy ảo không thành công');
        //   }
        // );
      },
    });
  }

  resetPassword: string = '';
  resetPasswordRepeat: string = '';
  check = true;
  isOk = false;
  passwordVisible = false;
  passwordRepeatVisible = false;

  resetPasswordFc(tpl: TemplateRef<{}>): void {
    //Reset mật khẩu máy ảo
    this.modalSrv.create({
      nzTitle: 'Reset mật khẩu máy ảo',
      nzContent: tpl,
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        if (this.resetPassword == this.resetPasswordRepeat && this.isOk) {
          this.message.success('Reset mật khẩu máy ảo thành công');
          // this.dataService
          //   .resetpassword({ id: this.instancesId, newPassword: this.resetPassword })
          //   .subscribe(
          //     (data: any) => {
          //       console.log("reset password", data);
          //       if (data == true) {
          //         this.message.success('Reset mật khẩu máy ảo thành công');
          //       } else {
          //         this.message.error('Reset mật khẩu không thành công');
          //       }
          //     },
          //     () => {
          //       this.message.error('Reset mật khẩu không thành công');
          //     }
          //   );
        } else {
          this.message.error('Reset mật khẩu không thành công');
        }
      },
    });
  }

  onInputChange(event: Event): void {
    if (this.resetPassword == this.resetPasswordRepeat) {
      this.check = true;
    } else {
      this.check = false;
      this.isOk = false;
    }
    if (this.resetPassword == this.resetPasswordRepeat && this.resetPasswordRepeat != '') {
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
        this.dataService.postAction(this.instancesId, body).subscribe(
          (data: any) => {
            if (data == true) {
              this.message.success('Tắt máy ảo thành công');
            } else {
              this.message.error('Tắt máy ảo không thành công');
            }
          },
          () => {
            this.message.error('Tắt máy ảo không thành công');
          }
        );
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
        this.dataService.postAction(this.instancesId, body).subscribe(
          (data: any) => {
            console.log(data);
            if (data == true) {
              this.message.success('Khởi động lại máy ảo thành công');
            } else {
              this.message.error('Khởi động lại máy ảo không thành công');
            }
          },
          () => {
            this.message.error('Khởi động lại máy ảo không thành công');
          }
        );
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

