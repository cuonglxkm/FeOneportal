import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BackupVmService } from '../../../../../shared/services/backup-vm.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { BackupVolumeService } from '../../../../../shared/services/backup-volume.service';

@Component({
  selector: 'one-portal-delete-backup-volume',
  templateUrl: './delete-backup-volume.component.html',
  styleUrls: ['./delete-backup-volume.component.less'],
})
export class DeleteBackupVolumeComponent implements AfterViewInit{
  @Input() region: number
  @Input() project: number
  @Input() idBackup: number
  @Input() backupName: string
  @Output() onCancel = new EventEmitter()
  @Output() onOk = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  value: string = ''

  isInput: boolean = false



  @ViewChild('backupInputName') backupInputName!: ElementRef<HTMLInputElement>;

  constructor(private notification: NzNotificationService,
              private backupService: BackupVolumeService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOk();
    }
  }

  onInputChange(value) {
    this.value = value
  }

  showModal(){
    this.isVisible = true
    setTimeout(() => {this.backupInputName?.nativeElement.focus()}, 1000)
  }

  handleCancel(): void {
    this.isVisible = false
    this.isLoading = false
    this.isInput = false;
    this.value = null;
    this.onCancel.emit();
  }

  handleOk(): void {
    this.isLoading = true;
    if (this.value == this.backupName) {
      this.isInput = false;
      this.backupService.deleteVolume(this.idBackup).subscribe(data => {
        this.isLoading = false;
        this.isVisible = false;
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.backup.volume.delete.success'))
        this.onOk.emit(data);
      }, error => {
        console.log('error', error);
        this.isLoading = false;
        this.isVisible = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.backup.volume.delete.error'))
      });
    } else {
      this.isInput = true;
      this.isLoading = false;
    }
  }

  ngAfterViewInit() {
    this.backupInputName?.nativeElement.focus();
  }
}
