import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { getCurrentRegionAndProject } from '@shared';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { SecurityService } from 'src/app/shared/services/security.service';
import { FormEnable2FA } from 'src/app/shared/models/security.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { RegionModel, ProjectModel } from '../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.less'],
})
export class SecurityComponent implements OnInit {

  toggleSwitch: boolean = false
  toggleSwitchGoogleAuthenticator: boolean = false
  isLoading: boolean = false
  isVisibleUpdate: boolean = false
  isLoadingUpdate: boolean = false
  isVisibleOTPForAuthenticator: boolean = false
  isVisibleReCreateGoogleAuthenticator: boolean = false
  isLoadingOTPForAuthenticator: boolean = false
  isVisibleAuthenticator: boolean = false
  isLoadingAuthenticator: boolean = false
  email:string = ''
  authenticatorKey: string = ''
  authenticatorQrData: string = ''
  authenticatorQrImage: string = ''
  isActiveGoogleAuthenticator: boolean = false
  isRecreateAuthenticator: boolean = false
  timeCountDown: number = 10;
  countdown: number = this.timeCountDown;
  isDisableButtonEmail: boolean = false;
  countdownInterval: any;

  timeCountDownGgAuthen: number = 10;
  countdownGgAuthen: number = this.timeCountDownGgAuthen;
  isDisableButtonGgAuthen: boolean = false;
  countdownIntervalGgAuthen: any;

  type: number = 0
  form: FormGroup<{
    otp: FormControl<string>;
  }> = this.fb.group({
    otp: ['', [Validators.required]],
  });

  formAuthenticator: FormGroup<{
    otpAuthenticator: FormControl<string>;
  }> = this.fb.group({
    otpAuthenticator: ['', [Validators.required]],
  });

  constructor(
    private service: SecurityService,
    private notification: NzNotificationService,
    private fb: NonNullableFormBuilder,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}


  ngOnInit() {

    this.email = this.tokenService.get().email
    
    this.service.getTwoFactorSetting().subscribe((data: any) => {
      this.toggleSwitch = data.enableEmail;
      this.toggleSwitchGoogleAuthenticator = data.enableAuthenticator;
      this.isActiveGoogleAuthenticator = data.enableAuthenticator;
    });
  }

  //  Email
  handleChangeSwitch(event){
    this.toggleSwitch = event
    console.log(this.toggleSwitch);
    this.service.getOneTimePassword().subscribe((data: any) => {
      console.log(data);
      this.isVisibleUpdate = true;
    }, error => {
      this.toggleSwitch = !this.toggleSwitch;
      this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail2"))
    });
  }

  handleRequestNewOTP() {
    this.isDisableButtonEmail = true;
    this.countdown = this.timeCountDown;
    this.startCountdown();
    this.service.getOneTimePassword().subscribe((data: any) => {
      this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("Thao tác thành công"));
      this.form.reset()
    }, error => {
      this.toggleSwitch = !this.toggleSwitch;
      this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail2"))
    });   
  }

  startCountdown() {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.isDisableButtonEmail = false;
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  handleSubmit(): void {
    let formeEnable2FA = new FormEnable2FA();
    this.isLoadingUpdate = true
    formeEnable2FA.twofactorType = "Email";
    formeEnable2FA.code = this.form.controls.otp.value.toString();
    formeEnable2FA.enable = this.toggleSwitch;
    this.service.updateTwoFactorSetting(formeEnable2FA).subscribe(data => {
      if (data.success == true) {
        this.isVisibleUpdate = false
        this.isLoadingUpdate = false
        this.form.reset()
        this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("Thao tác thành công"));
      }
      else
      {
        this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail"));
        this.isLoadingUpdate = false
      }
    }, error => {
      this.isLoadingUpdate = false
      this.toggleSwitch = !this.toggleSwitch;
      this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail2"));
    })
  }

  handleCancel(){
    this.isVisibleUpdate = false;
    this.toggleSwitch = !this.toggleSwitch;
    this.form.reset()
  }

  // Authenticator
  handleChangeSwitchAuthenticator(event){
    this.toggleSwitchGoogleAuthenticator = event
    this.service.getOTPForAuthenticator().subscribe((data: any) => {
      this.isVisibleOTPForAuthenticator = true;
      this.form.reset()
    }, error => {
      this.toggleSwitchGoogleAuthenticator = !this.toggleSwitchGoogleAuthenticator;
      this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail2"))
    });
  }

  startCountdownGgAuthen() {
    this.countdownIntervalGgAuthen = setInterval(() => {
      this.countdownGgAuthen--;
      if (this.countdownGgAuthen <= 0) {
        this.isDisableButtonGgAuthen = false;
        clearInterval(this.countdownIntervalGgAuthen);
      }
    }, 1000);
  }

  handleRequestNewOTPForAuthenticator(event){
    this.isDisableButtonGgAuthen = true;
    this.countdownGgAuthen = this.timeCountDownGgAuthen;
    this.startCountdownGgAuthen();
    this.service.getOTPForAuthenticator().subscribe((data: any) => {
      this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("Thao tác thành công"));
      this.form.reset()
      this.type = 1
    }, error => {
      this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail2"))
    });
  }


  handleSubmitOTPForAuthenticator(){
    let formeEnable2FA = new FormEnable2FA();
    formeEnable2FA.twofactorType = "Email";
    formeEnable2FA.code = this.form.controls.otp.value.toString();
    formeEnable2FA.enable = this.toggleSwitchGoogleAuthenticator;
    this.isLoadingOTPForAuthenticator = true
    this.service.submitOTPForAuthenticator(formeEnable2FA).subscribe((data: any) => {
      if (data.success == true) {
        if (formeEnable2FA.enable == true) {
          this.authenticatorKey = data.key;
          this.authenticatorQrImage = data.authenticatorQrImage;
          //this.authenticatorQrData = 'otpauth://totp/OnePortal:' + this.email + '?secret=' + data.key + '&issuer=OnePortal';
          this.isVisibleOTPForAuthenticator = false;
          this.isVisibleAuthenticator = true;
          console.log(this.authenticatorKey);
          this.isLoadingOTPForAuthenticator = false
          this.form.reset()
        }
        else
        {
          this.isVisibleOTPForAuthenticator = false;
          this.toggleSwitchGoogleAuthenticator = false;
          this.isLoadingOTPForAuthenticator = false
          this.isActiveGoogleAuthenticator = false;
          this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("Thao tác thành công"));
          this.form.reset()
        }
      }
      else
      {
        this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail"));
        this.isLoadingOTPForAuthenticator = false
      }
    }, error => {
      this.isLoadingOTPForAuthenticator = false
      this.toggleSwitchGoogleAuthenticator = !this.toggleSwitchGoogleAuthenticator;
      this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail2"))
    });
    
    console.log(this.toggleSwitchGoogleAuthenticator);
  }

  handleCancelOTPForAuthenticator() {
    this.isVisibleOTPForAuthenticator = false;
    
    if (this.isRecreateAuthenticator == false) {
      this.toggleSwitchGoogleAuthenticator = !this.toggleSwitchGoogleAuthenticator;
    }

    this.isRecreateAuthenticator = false;
    this.form.reset()
  }

  handleSubmitAuthenticator(event){
    let formeEnable2FA = new FormEnable2FA();
    formeEnable2FA.twofactorType = "Authenticator";
    formeEnable2FA.code = this.formAuthenticator.controls.otpAuthenticator.value.toString();
    formeEnable2FA.enable = this.toggleSwitchGoogleAuthenticator;
    this.isLoadingAuthenticator = true
    this.service.updateTwoFactorSetting(formeEnable2FA).subscribe(data => {
      if (data.success == true) {
        this.isLoadingAuthenticator = false
        this.isVisibleAuthenticator = false;
        this.isActiveGoogleAuthenticator = true;
        this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("Thao tác thành công"));
        this.formAuthenticator.reset()
      }
      else
      {
        this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail"));
        this.isLoadingAuthenticator = false
      }
    }, error => {
      this.isVisibleAuthenticator = false;
      this.isLoadingAuthenticator = false
      this.toggleSwitchGoogleAuthenticator = !this.toggleSwitchGoogleAuthenticator;
      this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail2"));
    })
  }

  handleCancelAuthenticator() {
    this.isVisibleAuthenticator = false;
    this.isVisibleOTPForAuthenticator = false;
    if(this.type === 1){
      this.toggleSwitchGoogleAuthenticator = !this.toggleSwitchGoogleAuthenticator;
    }
  }

  handleRecreateAuthenticator(event){
    this.service.getOTPForAuthenticator().subscribe((data: any) => {
      this.isVisibleReCreateGoogleAuthenticator = true;
      this.isRecreateAuthenticator = true;
      this.type = 2
    }, error => {
      this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail2"))
    });
  }

  handleCancelRecreateGoogleAuthenticator(){
    this.isVisibleReCreateGoogleAuthenticator = false
    this.form.reset()
  }

  handleSubmitRecreateGoogleAuthenticator(){
    let formeEnable2FA = new FormEnable2FA();
    formeEnable2FA.twofactorType = "Email";
    formeEnable2FA.code = this.form.controls.otp.value.toString();
    formeEnable2FA.enable = this.toggleSwitchGoogleAuthenticator;
    this.isLoadingOTPForAuthenticator = true
    this.service.submitOTPForAuthenticator(formeEnable2FA).subscribe((data: any) => {
      if (data.success == true) {
        if (formeEnable2FA.enable == true) {
          this.authenticatorKey = data.key;
          this.authenticatorQrData = 'otpauth://totp/OnePortal:' + this.email + '?secret=' + data.key + '&issuer=OnePortal';
          this.isVisibleReCreateGoogleAuthenticator = false;
          this.isVisibleAuthenticator = true;
          console.log(this.authenticatorKey);
          this.isLoadingOTPForAuthenticator = false
          this.form.reset()
        }
        else
        {
          this.isVisibleReCreateGoogleAuthenticator = false;
          this.isLoadingOTPForAuthenticator = false
          this.isActiveGoogleAuthenticator = false;
          this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("Thao tác thành công"));
          this.form.reset()
        }
      }
      else
      {
        this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail"));
        this.isLoadingOTPForAuthenticator = false
      }
    }, error => {
      this.isLoadingOTPForAuthenticator = false
      this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail2"))
    });
  }
}
