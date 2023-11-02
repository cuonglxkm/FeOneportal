import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LoginService } from '@core/services/http/login/login.service';
import { fnCheckForm } from '@utils/tools';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { BasicConfirmModalComponent } from '../../base-modal';
import { AuthService } from '@app/core/services/firebase/auth.service';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginModalComponent extends BasicConfirmModalComponent implements OnInit {
  loginModalForm!: FormGroup;
  override params: object;

  constructor(protected override modalRef: NzModalRef, private fb: FormBuilder, private afService: AuthService) {
    super(modalRef);
    this.params = {};
  }

  // Return false to not close the dialog
  protected getCurrentValue(): Observable<NzSafeAny> {
    if (!fnCheckForm(this.loginModalForm)) {
      return of(false);
    }

    const param = this.loginModalForm.value;
    // login with firebase
    return this.afService.signIn(param.userName, param.password)
      .pipe(
        catchError(() => {
          return of(false);
        })
      )
  }

  initForm(): void {
    this.loginModalForm = this.fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.initForm();
  }
}
