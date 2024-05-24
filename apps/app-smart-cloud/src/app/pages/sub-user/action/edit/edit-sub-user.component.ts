import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { FormUpdateSubUser } from '../../../../shared/models/sub-user.model';
import { SubUserService } from '../../../../shared/services/sub-user.service';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-edit-sub-user',
  templateUrl: './edit-sub-user.component.html',
  styleUrls: ['./edit-sub-user.component.less'],
})
export class EditSubUserComponent {
  @Input() region: number
  @Input() project: number
  @Input() idSubUser: string
  @Input() uid: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isLoading: boolean = false
  isVisible: boolean = false

  validateForm: FormGroup<{
    access: FormControl<string>
  }> = this.fb.group({
    access: ['full', [Validators.required]]
  })

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private subUserService: SubUserService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  showModal() {
    this.isVisible = true
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit()
  }


  handleOk() {
    this.isLoading = true
    let formUpdate = new FormUpdateSubUser()
    formUpdate.uid = this.uid
    formUpdate.subuser = this.idSubUser
    formUpdate.actorEmail = ''
    if(this.validateForm.controls.access.value.includes('none')) {
      this.validateForm.controls.access.setValue('')
    } else {
      this.validateForm.controls.access.setValue('full')
    }
    formUpdate.access = this.validateForm.controls.access.value
    this.subUserService.updateSubUser(formUpdate).subscribe(data => {
      if(data) {
        this.isLoading = false
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.edit.subuser.success'))
        this.onOk.emit()
      } else {
        this.isLoading = false
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.edit.subuser.fail'))
        this.onOk.emit()
      }
    }, error => {
      this.isLoading = false
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.edit.subuser.fail'))
    })
  }
}
