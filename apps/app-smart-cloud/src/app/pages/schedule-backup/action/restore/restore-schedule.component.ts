import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ScheduleService } from '../../../../shared/services/schedule.service';
import { FormAction } from '../../../../shared/models/schedule.model';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-restore-schedule',
  templateUrl: './restore-schedule.component.html',
  styleUrls: ['./restore-schedule.component.less'],
})
export class RestoreScheduleComponent {
  @Input() id: number
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()

  isVisible: boolean = false
  isLoading: boolean = false

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private backupScheduleService: ScheduleService) {
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
    let formAction = new FormAction()
    formAction.scheduleId = this.id
    formAction.customerId = this.tokenService.get()?.userId
    formAction.actionType = 'reactive'

    this.backupScheduleService.action(formAction).subscribe(data => {
      this.isVisible = false;
      this.isLoading = false
      this.notification.success(this.i18n.fanyi("app.status.success"),this.i18n.fanyi("schedule.backup.notify.restore.success"))
      this.onOk.emit()
    }, error =>  {
      this.isVisible = false;
      this.isLoading = false
      this.notification.error(this.i18n.fanyi("app.status.success"),this.i18n.fanyi("schedule.backup.notify.restore.fail"))
      this.onOk.emit()
    })
  }
}
