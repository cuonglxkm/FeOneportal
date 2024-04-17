import { Component, Input, OnInit } from '@angular/core';
import { LoadingService } from '@delon/abc/loading';
import { camelizeKeys } from 'humps';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { filter, finalize, map } from 'rxjs/operators';
import { KafkaCredential } from '../../../core/models/kafka-credential.model';
import { KafkaCredentialsService } from '../../../services/kafka-credentials.service';

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

  // Check delete
  isVisibleDelete = false;
  isErrorCheckDelete = false;
  isInitModal = true;
  msgError = '';
  userNameDelete: string;

  constructor(
    private kafkaCredentialService: KafkaCredentialsService,
    private notification: NzNotificationService,
    private loadingSrv: LoadingService
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
    this.isVisibleDelete = true;
    this.isErrorCheckDelete = false;
    this.isInitModal = true;
    this.msgError = '';
    this.currentUserName = data.username;
  }

  checkUserNameDel() {
    this.isInitModal = false;
    if (this.userNameDelete.length == 0) {
      this.isErrorCheckDelete = true;
      this.msgError = 'Vui lòng nhập tên tài khoản';
    } else if (this.userNameDelete != this.currentUserName) {
      this.isErrorCheckDelete = true;
      this.msgError = 'Tên tài khoản nhập chưa đúng';
    } else {
      this.isErrorCheckDelete = false;
      this.msgError = '';
    }
  }

  handleCancelDelete() {
    this.isVisibleDelete = false;
  }

  handleOkDelete() {
    this.isVisibleDelete = false;
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.kafkaCredentialService
      .deleteUser(this.serviceOrderCode, this.currentUserName)
      .pipe(
        finalize(() => {
          this.loadingSrv.close();
        })
      )
      .subscribe((data) => {
        if (data && data.code == 200) {
          this.reload();
          this.getCredentials();
          this.notification.success('Thông báo', data.msg, {
            nzDuration: 2000,
          });
        } else {
          this.notification.error('Thất bại', data.msg);
        }
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
    
    //test
    this.isVisibleOtpModal = true;
    this.currentUserName = username;
    this.titleOtp = 'Mã xác thực OTP đã được gửi đến email: nhiennd@vnpt.vn';
    this.keyCheckOtp = '123456';
    this.inputOtpCode = '';

    /* Tạm ẩn luồng gửi mail 
    this.kafkaService.sendOtpForgotPassword(this.serviceOrderCode, username).subscribe(r => {
      if(r && r.code === 200){
        this.isVisibleOtpModal = true;
        this.currentUserName = username;
        this.titleOtp = r.msg;
        this.keyCheckOtp = r.data;
        this.inputOtpCode = '';
      }
    })
    */
  }

  verifyOtp(){
    if (this.inputOtpCode.length !== 6) {
      this.notification.error('Thông báo', 'Mã xác thực bao gồm 6 chữ số, xin vui lòng kiểm tra lại!', {
        nzDuration: 2000,
      });
      return;
    }

    //test
    if (this.inputOtpCode == '123456') {
      this.closeOtpModal();
      this.changeTabStatus(this.showForgotPassword);
    } else {
      this.notification.error('Thông báo', 'Mã xác thực không đúng, xin vui lòng kiểm tra lại!', {
        nzDuration: 2000,
      });
    }

    /* Tạm ẩn luồng xác thực OTP
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
    */
  }
}
