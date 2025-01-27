import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { IpFloatingService } from '../../../shared/services/ip-floating.service';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { IpPublicService } from 'src/app/shared/services/ip-public.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'one-portal-delete-ip-floating',
  templateUrl: './delete-ip-floating.component.html',
  styleUrls: ['./delete-ip-floating.component.less'],
})
export class DeleteIpFloatingComponent{
  @Input() region; number
  @Input() project: number
  @Input() idIpFloating: number
  @Input() ip: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  validateForm: FormGroup<{
    ip: FormControl<string>
  }> = this.fb.group({
    ip: ['', [Validators.required]]
  });
  disableSubmit = true;
  loading: boolean;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private ipFloatingService: IpFloatingService,
              private ipPublicService: IpPublicService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private fb: NonNullableFormBuilder) {
  }

  showModal(){
    this.isVisible = true
  }

  handleCancel(){
    this.isVisible = false
    this.isLoading =  false
    this.validateForm.controls['ip'].setValue('');
  }

  handleOk() {
    this.isLoading = true
    this.loading = true;
    this.disableSubmit = true;
    if(this.validateForm.valid) {
      if(this.ip.includes(this.validateForm.controls.ip.value)){
        this.ipPublicService.remove(this.idIpFloating)
          .pipe(finalize(() => {
            this.handleCancel()
          }))
          .subscribe(data => {
          if(data) {
            this.isVisible = false
            this.isLoading =  false
            this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('ip.floating.nofitacation.remove.success'))
            this.onOk.emit(data)
          }
        }, error => {
          this.isVisible = false
          this.isLoading =  false
          this.notification.success(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('ip.floating.nofitacation.remove.fail'))
        })
      }
    }
  }

  changeInput() {
    if (this.validateForm.controls['ip'].value == this.ip) {
      this.disableSubmit = false
    } else {
      this.disableSubmit = true
    }

  }
}
