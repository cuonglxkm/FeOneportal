import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { LoginInOutService } from '@core/services/common/login-in-out.service';
import { WindowService } from '@core/services/common/window.service';
import { LoginService } from '@core/services/http/login/login.service';
import { MenuStoreService } from '@store/common-store/menu-store.service';
import { SpinService } from '@store/common-store/spin.service';
import { UserInfoService } from '@store/common-store/userInfo.service';
import { fnCheckForm } from '@utils/tools';
import { AuthService } from '@app/core/services/firebase/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginFormComponent implements OnInit {
  validateForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private loginInOutService: LoginInOutService,
    private afService: AuthService,
    private spinService: SpinService,
    private translate: TranslateService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [null]
    });
  }

  submitForm(): void {
    // Validate the form
    if (!fnCheckForm(this.validateForm)) {
      return;
    }
    // set global loading
    this.spinService.setCurrentGlobalSpinStore(true);
    // Get the value of the form
    const param = this.validateForm.getRawValue();

    // login with firebase
    this.afService.signIn(param.userName, param.password)
      .pipe(
        finalize(() => {
          this.spinService.setCurrentGlobalSpinStore(false)
        })
      )
      .subscribe((res) => {
        const { user } = res

        if (user?.multiFactor) {
          let usr = JSON.parse(JSON.stringify(user.multiFactor))
          this.loginInOutService.loginIn(usr.user?.stsTokenManager?.accessToken)
            .then(() => {
              this.router.navigateByUrl('admin/dashboard/analysis');
            })
            .finally(() => {
              this.spinService.setCurrentGlobalSpinStore(false);
            });
        }
      })
  }

  onGoogleSignIn(): void {
    this.afService.googleAuth()
      .pipe(
        finalize(() => {
          this.spinService.setCurrentGlobalSpinStore(false)
        })
      )
      .subscribe((res) => {
        const { user } = res

        if (user?.multiFactor) {
          let usr = JSON.parse(JSON.stringify(user.multiFactor))
          this.loginInOutService.loginIn(usr.user?.stsTokenManager?.accessToken)
            .then(() => {
              this.router.navigateByUrl('admin/dashboard/analysis');
            })
            .finally(() => {
              this.spinService.setCurrentGlobalSpinStore(false);
            });
        }
      })
  }
}
