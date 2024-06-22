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
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  toggleSwitch: boolean = false
  toggleSwitchGoogleAuthenticator: boolean = false
  isLoading: boolean = false
  isVisibleUpdate: boolean = false
  isVisibleOTPForAuthenticator: boolean = false
  isVisibleAuthenticator: boolean = false
  email:string = ''
  authenticatorKey: string = ''
  authenticatorQrData: string = ''
  isActiveGoogleAuthenticator: boolean = false
  isRecreateAuthenticator: boolean = false

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

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChange(project: ProjectModel) {
    this.project = project.id;
  }

  ngOnInit() {

    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

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
    this.service.getOneTimePassword().subscribe((data: any) => {
      this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("Thao tác thành công"));
    }, error => {
      this.toggleSwitch = !this.toggleSwitch;
      this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail2"))
    });
  }

  handleSubmit(): void {
    let formeEnable2FA = new FormEnable2FA();
    formeEnable2FA.twofactorType = "Email";
    formeEnable2FA.code = this.form.controls.otp.value.toString();
    formeEnable2FA.enable = this.toggleSwitch;
    this.service.updateTwoFactorSetting(formeEnable2FA).subscribe(data => {
      if (data.success == true) {
        this.isVisibleUpdate = false
        this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("Thao tác thành công"));
      }
      else
      {
        this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail"));
      }
    }, error => {
      this.isVisibleUpdate = false;
      this.toggleSwitch = !this.toggleSwitch;
      this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail2"));
    })
  }

  handleCancel(){
    this.isVisibleUpdate = false;
  }

  // Authenticator
  handleChangeSwitchAuthenticator(event){
    this.toggleSwitchGoogleAuthenticator = event
    this.service.getOTPForAuthenticator().subscribe((data: any) => {
      this.isVisibleOTPForAuthenticator = true;
    }, error => {
      this.toggleSwitchGoogleAuthenticator = !this.toggleSwitchGoogleAuthenticator;
      this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail2"))
    });
  }

  handleRequestNewOTPForAuthenticator(event){
    this.service.getOTPForAuthenticator().subscribe((data: any) => {
      this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("Thao tác thành công"));
    }, error => {
      this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail2"))
    });
  }

  handleSubmitOTPForAuthenticator(){
    let formeEnable2FA = new FormEnable2FA();
    formeEnable2FA.twofactorType = "Email";
    formeEnable2FA.code = this.form.controls.otp.value.toString();
    formeEnable2FA.enable = this.toggleSwitchGoogleAuthenticator;

    this.service.submitOTPForAuthenticator(formeEnable2FA).subscribe((data: any) => {
      if (data.success == true) {
        if (formeEnable2FA.enable == true) {
          this.authenticatorKey = data.key;
          this.authenticatorQrData = 'otpauth://totp/OnePortal:' + this.email + '?secret=' + data.key + '&issuer=OnePortal';
          this.isVisibleOTPForAuthenticator = false;
          this.isVisibleAuthenticator = true;
          console.log(this.authenticatorKey);
        }
        else
        {
          this.isVisibleOTPForAuthenticator = false;
          this.toggleSwitchGoogleAuthenticator = false;
          this.isActiveGoogleAuthenticator = false;
          this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("Thao tác thành công"));
        }
      }
      else
      {
        this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail"));
      }
    }, error => {
      this.isVisibleOTPForAuthenticator = false;
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
  }

  handleSubmitAuthenticator(event){
    let formeEnable2FA = new FormEnable2FA();
    formeEnable2FA.twofactorType = "Authenticator";
    formeEnable2FA.code = this.formAuthenticator.controls.otpAuthenticator.value.toString();
    formeEnable2FA.enable = this.toggleSwitchGoogleAuthenticator;
    this.service.updateTwoFactorSetting(formeEnable2FA).subscribe(data => {
      if (data.success == true) {
        this.isVisibleAuthenticator = false;
        this.isActiveGoogleAuthenticator = true;
        this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("Thao tác thành công"));
      }
      else
      {
        this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail"));
      }
    }, error => {
      this.isVisibleAuthenticator = false;
      this.toggleSwitchGoogleAuthenticator = !this.toggleSwitchGoogleAuthenticator;
      this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail2"));
    })
  }

  handleCancelAuthenticator() {
    this.isVisibleAuthenticator = false;
    this.isVisibleOTPForAuthenticator = false;
    this.toggleSwitchGoogleAuthenticator = !this.toggleSwitchGoogleAuthenticator;
  }

  handleRecreateAuthenticator(event){
    this.service.getOTPForAuthenticator().subscribe((data: any) => {
      this.isVisibleOTPForAuthenticator = true;
      this.isRecreateAuthenticator = true;
    }, error => {
      this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.security.noti.fail2"))
    });
  }
}
