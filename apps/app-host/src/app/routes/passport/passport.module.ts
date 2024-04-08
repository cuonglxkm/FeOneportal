import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { CallbackComponent } from './callback.component';
import { UserLockComponent } from './lock/lock.component';
import { UserLoginComponent } from './login/login.component';
import { PassportRoutingModule } from './passport-routing.module';
import { UserRegisterComponent } from './register/register.component';
import { UserRegisterResultComponent } from './register-result/register-result.component';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import {
  RECAPTCHA_SETTINGS,
  RECAPTCHA_V3_SITE_KEY,
  RecaptchaFormsModule,
  RecaptchaModule,
  RecaptchaSettings,
  RecaptchaV3Module,
} from 'ng-recaptcha';
import { environment } from '@env/environment';
import { ReactiveFormsModule } from '@angular/forms';
import { UserOtpComponent } from './otp/otp.component';

const COMPONENTS = [
  UserLoginComponent,
  UserRegisterResultComponent,
  UserRegisterComponent,
  UserLockComponent,
  CallbackComponent,
  UserOtpComponent,
];

@NgModule({
  imports: [
    SharedModule,
    PassportRoutingModule,
    NzCollapseModule,
    ReactiveFormsModule,
    RecaptchaModule,
    RecaptchaFormsModule,
  ],
  declarations: [...COMPONENTS],
  providers: [
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: environment['recaptcha'].siteKey,
      } as RecaptchaSettings,
    },
  ],
})
export class PassportModule {}
