import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ScheduleService } from '../../../../shared/services/schedule.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { FormDeleteFileSystem } from '../../../../shared/models/file-system.model';

@Component({
  selector: 'one-portal-delete-schedule',
  templateUrl: './delete-schedule.component.html',
  styleUrls: ['./delete-schedule.component.less'],
})
export class DeleteScheduleComponent implements AfterViewInit{
  @Input() id: number;
  @Input() nameScheduleBackup: string;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onOk = new EventEmitter<void>();

  isVisible: boolean = false
  isLoading: boolean = false

  value: string;
  isInput: boolean = false;

  @ViewChild('scheduleBackupName') scheduleBackupName!: ElementRef<HTMLInputElement>;
  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private backupScheduleService: ScheduleService) {
  }

  ngAfterViewInit() {
    this.scheduleBackupName?.nativeElement.focus();
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOk();
    }
  }

  onInput(value) {
    this.value = value;
  }

  showModal() {
    this.isVisible = true
    setTimeout(() => {
      this.scheduleBackupName?.nativeElement.focus();
    }, 1000);
  }

  handleCancel(): void {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit();
  }

  handleOk(): void {
    this.isLoading = true
    if (this.value == this.nameScheduleBackup) {
      this.isInput = false;
      const customerId = this.tokenService.get()?.userId
      this.backupScheduleService.delete(customerId, this.id).subscribe(data => {
        this.isVisible = false
        this.isLoading = false
        this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("schedule.backup.notify.remove.success"))
        this.onOk.emit()
      }, error =>  {
        this.isVisible = false
        this.isLoading = false
        this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("schedule.backup.notify.remove.fail"))
        this.onOk.emit()
      })
    } else {
      this.isInput = true;
      this.isLoading = false;
    }

  }
}
