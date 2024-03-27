import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ScheduleService } from '../../../../shared/services/schedule.service';
import { FormAction } from '../../../../shared/models/schedule.model';

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
        this.notification.success('Thành công', 'Tạm dừng lịch thành công')
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
      this.notification.error('Thất bại', 'Tạm dừng lịch thất bại')
      this.onOk.emit()
    })
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit()
  }
}
