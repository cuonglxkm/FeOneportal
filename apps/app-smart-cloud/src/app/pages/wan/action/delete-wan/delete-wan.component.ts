import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { WanService } from '../../../../shared/services/wan.service';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-delete-wan',
  templateUrl: './delete-wan.component.html',
  styleUrls: ['./delete-wan.component.less'],
})
export class DeleteWanComponent {
  @Input() region: number
  @Input() project: number
  @Input() idWan: number
  @Input() addressWan: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  validateForm: FormGroup<{
    ip: FormControl<string>
  }> = this.fb.group({
    ip: ['', [Validators.required]]
  });

  isLoading: boolean = false
  isVisible: boolean = false

  constructor(private fb: NonNullableFormBuilder,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private ipWanService: WanService) {
  }
  showModalDelete() {
    this.isVisible = true
  }

  handleCancelDelete() {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit()
  }

  handleOkDelete() {
    this.isLoading = true
    if(this.addressWan.includes(this.validateForm.controls.ip.value)){
      this.ipWanService.delete(this.idWan).subscribe(data => {
        if(data){
          this.isVisible = false
          this.isLoading = false
          this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('wan.nofitacation.ip.wan.remove.sucess'))
          this.onOk.emit(data)
        } else {
          this.isVisible = false
          this.isLoading = false
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('wan.nofitacation.ip.wan..remove.fail'))
        }
      }, error => {
        this.isVisible = false
        this.isLoading = false
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('wan.nofitacation.ip.wan..remove.fail'))
      })
    }
  }
}
