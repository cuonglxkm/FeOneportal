import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ScheduleService } from '../../../../shared/services/schedule.service';
import { FormAction } from '../../../../shared/models/schedule.model';

@Component({
  selector: 'one-portal-replay-schedule',
  templateUrl: './replay-schedule.component.html',
  styleUrls: ['./replay-schedule.component.less'],
})
export class ReplayScheduleComponent {
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

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit()
  }

  handleOk() {
    let formAction = new FormAction()
    formAction.scheduleId = this.id
    formAction.customerId = this.tokenService.get()?.userId
    formAction.actionType = 'play'

    this.backupScheduleService.action(formAction).subscribe(data => {
      this.isVisible = false;
      this.isLoading = false
      this.notification.success('Thành công', 'Tiếp tục lịch backup thành công')
      this.onOk.emit()
    }, error =>  {
      this.isVisible = false;
      this.isLoading = false
      this.notification.error('Thất bại','Tiếp tục lịch backup thất bại')
      this.onOk.emit()
    })
  }
}
