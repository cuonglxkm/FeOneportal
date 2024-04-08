import {HttpContext} from '@angular/common/http';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ALLOW_ANONYMOUS} from '@delon/auth';
import {_HttpClient} from '@delon/theme';
import {MatchControl} from '@delon/util/form';
import {NzSafeAny} from 'ng-zorro-antd/core/types';
import {finalize} from 'rxjs';
import {NzNotificationService} from "ng-zorro-antd/notification";
import {ReCaptchaV3Service} from "ng-recaptcha";
import { environment } from '@env/environment';
import { UserRegisterComponent } from '../register/register.component';
import { NzMessageService } from 'ng-zorro-antd/message';

export interface UserCreateDto {
  email: string;
  password: any;
  accountType: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  province: string;
  address: string;
  channelSaleId: number;
  taxCode: string;
  birthDay: Date;
  haveIdentity: boolean;
}

@Component({
  selector: 'passport-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.less'],
  
})
export class UserOtpComponent {
  
}
