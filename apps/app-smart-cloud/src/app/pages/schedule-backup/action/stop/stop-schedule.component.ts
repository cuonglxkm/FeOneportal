import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ScheduleService } from '../../../../shared/services/schedule.service';
import { FormAction } from '../../../../shared/models/schedule.model';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-stop-schedule',
  templateUrl: './stop-schedule.component.html',
  styleUrls: ['./stop-schedule.component.less'],
})
export class StopScheduleComponent {
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

  handleOk() {
    this.isLoading = true
    let formAction = new FormAction()
    formAction.scheduleId = this.id
    formAction.customerId = this.tokenService.get()?.userId
    formAction.actionType = 'pause'

    this.backupScheduleService.action(formAction).subscribe(data => {
      // if(data) {
        this.isVisible = false
        this.isLoading = false
        this.notification.success(this.i18n.fanyi("app.status.success"),this.i18n.fanyi("schedule.backup.notify.stop.success"))
        this.onOk.emit()
      // } else {
      //   this.isVisible = false
      //   this.isLoading = false
      //   this.notification.error('Thất bại', 'Tạm dừng lịch thất bại')
      //   this.onOk.emit()
      // }
    },error => {
      this.isVisible = false
      this.isLoading = false
      this.notification.error(this.i18n.fanyi("app.status.fail"),this.i18n.fanyi("schedule.backup.notify.stop.fail"))
      this.onOk.emit()
    })
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit()
  }
}
