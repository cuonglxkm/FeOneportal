import { Component, Input, OnInit } from '@angular/core';
import { filter, map } from 'rxjs/operators';
import { KafkaCredentialsService } from '../../../services/kafka-credentials.service';
import { KafkaCredential } from '../../../core/models/kafka-credential.model';
import { camelizeKeys } from 'humps';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { KafkaService } from '../../../services/kafka.service';

@Component({
  selector: 'one-portal-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.css'],
})
export class CredentialsComponent implements OnInit {
  /* Input, Output */
  @Input() serviceOrderCode: string;

  /* Constants */
  showListCredentials = 0;
  showCreateCredential = 1;
  showUpdatePassword = 2;
  showForgotPassword = 3;

  /* Status */
  tabStatus: number;
  isVisibleOtpModal: boolean;
  currentUserName: string;

  /* Model */
  stringSearch: string;
  page: number;
  size: number;
  total: number;
  credentials: KafkaCredential[];
  titleOtp: string;
  keyCheckOtp: string;
  inputOtpCode: string;

  constructor(
    private kafkaCredentialService: KafkaCredentialsService,
    private kafkaService: KafkaService,
    private modal: NzModalService,
    private notification: NzNotificationService
  ) {
    this.tabStatus = this.showListCredentials;
    this.isVisibleOtpModal = false;
    this.reload();
  }

  ngOnInit(): void {
    this.getCredentials();
  }

  updatePassword(data: KafkaCredential) {
    this.kafkaCredentialService.setCredential(data);
    this.changeTabStatus(this.showUpdatePassword);
  }

  forgotPassword(data: KafkaCredential) {
    this.kafkaCredentialService.setCredential(data);
    this.sendOtpChangePassword(this.serviceOrderCode, data.username);
  }

  deleteUser(data: KafkaCredential) {
    this.modal.create({
      nzTitle: 'Xoá tài khoản',
      nzContent:
        '<h3>Bạn chắc chắn muốn xoá tài khoản có username <br> <b>' + data.username + '</b> ?</h3>',
      nzBodyStyle: { textAlign: 'center' },
      nzOkText: 'Xác nhận',
      nzOkType: 'primary',
      nzOkDanger: false,
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.kafkaCredentialService
          .deleteUser(this.serviceOrderCode, data.username)
          .pipe(filter((r) => r && r.code == 200))
          .subscribe(() => {
            this.reload();
            this.getCredentials();
            this.notification.success('Thông báo', 'Xoá tài khoản thành công', {
              nzDuration: 2000,
            });
          });
      },
    });
  }

  changePage(event) {
    this.page = event;
    this.getCredentials();
  }

  changeSize(event) {
    this.size = event;
    this.getCredentials();
  }

  changeTabStatus(tab: number) {
    this.tabStatus = tab;
    this.kafkaCredentialService.setActivateTab(tab);
  }

  onCloseForm() {
    this.reload();
    this.getCredentials();
    // cần đợi getCredentials fetch xong mới thực hiện đổi tab?
    this.changeTabStatus(this.showListCredentials);
  }

  onKeyPressOtp(event: KeyboardEvent) {
    if (event.keyCode < 48 || event.keyCode > 57 || this.inputOtpCode.length >= 6) {
      event.preventDefault();
    }
  }

  onPasteOTP(event: ClipboardEvent) {
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData.getData('text');

    const regex = /^[0-9]*$/;
    if (!regex.test(pastedText)) {
      event.preventDefault();
    }
  }

  changeOtp(otpCode: string) {
    this.inputOtpCode = otpCode.trim().slice(0, 6);
  }

  requestResendOtp(){
    this.sendOtpChangePassword(this.serviceOrderCode, this.currentUserName);
  }

  closeOtpModal(){
    this.isVisibleOtpModal = false;
  }

  reload() {
    this.kafkaCredentialService.setCredential(null);

    this.page = 1;
    this.size = 10;
    this.total = 0;
    this.stringSearch = '';
  }

  getCredentials() {
    this.kafkaCredentialService
      .getCredentials(
        this.stringSearch.trim(),
        this.serviceOrderCode,
        this.page,
        this.size
      )
      .pipe(
        filter((r) => r && r.code == 200),
        map((r) => r.data)
      )
      .subscribe((data) => {
        this.total = data.totals;
        this.size = data.size;
        this.credentials = camelizeKeys(data.results) as KafkaCredential[];
      });
  }

  sendOtpChangePassword(serviceOrderCode: string, username: string){
    this.kafkaService.sendOtpForgotPassword(this.serviceOrderCode, username).subscribe(r => {
      if(r && r.code === 200){
        this.isVisibleOtpModal = true;
        this.currentUserName = username;
        this.titleOtp = r.msg;
        this.keyCheckOtp = r.data;
        this.inputOtpCode = '';
      }
    })
  }

  verifyOtp(){
    if (this.inputOtpCode.length !== 6) {
      this.notification.error('Thông báo', 'Mã xác thực bao gồm 6 chữ số, xin vui lòng kiểm tra lại!', {
        nzDuration: 2000,
      });
      return;
    }
    this.kafkaService
      .verifyOtpForgotPassword(
        this.keyCheckOtp,
        this.serviceOrderCode,
        this.inputOtpCode
      )
      .subscribe((r) => {
        if (r && r.code == 200) {
          this.closeOtpModal();
          this.changeTabStatus(this.showForgotPassword);
        }
      });
  }
}
