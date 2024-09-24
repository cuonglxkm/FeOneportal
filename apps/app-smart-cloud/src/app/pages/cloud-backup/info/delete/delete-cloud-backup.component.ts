import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  Inject,
  OnInit,
} from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { CloudBackup } from '../../cloud-backup.model';
import { CloudBackupService } from 'src/app/shared/services/cloud-backup.service';

@Component({
  selector: 'one-portal-delete-cloud-backup',
  templateUrl: './delete-cloud-backup.component.html',
  styleUrls: ['./delete-cloud-backup.component.less']
})
export class DeleteCloudBackupComponent implements OnInit{

  @Input() cloudBackupData: CloudBackup;
  @Input() isVisible: boolean;
  @Input() canClick: boolean = true;
  @Output() onOk = new EventEmitter();
  @Output() isVisibleChange = new EventEmitter<boolean>();

  isLoading: boolean = false;
  inputConfirm: string = '';
  checkInputEmpty: boolean = false;
  checkInputConfirm: boolean = false;
  constructor(
    private cdr: ChangeDetectorRef,
    private notification: NzNotificationService,
    private cloudBackupService: CloudBackupService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {}
  
  ngOnInit(): void {
  }

  // openModal() {
  //   this.isVisible = true;
  // }

  onInputChange(value: string) {
    this.inputConfirm = value;
  }

  handleCancelDelete() {
    this.inputConfirm = '';
    this.checkInputConfirm = false;
    this.checkInputEmpty = false;
    this.isVisible = false;
    this.isVisibleChange.emit(false);
  }

  handleOkDelete() {
    if (this.inputConfirm == this.cloudBackupData.name) {
      this.isLoading = true
      this.cloudBackupService.deleteCloudBackup(this.cloudBackupData.id).pipe(finalize(()=>{
        this.isLoading = false
      })).subscribe({
        next:()=>{
          this.notification.success(this.i18n.fanyi("app.status.success"), "Thao tác thành công")
          this.isVisible = false;
          this.isVisibleChange.emit(false);
          this.onOk.emit()
        },
        error:()=>{
          this.notification.success(this.i18n.fanyi("app.status.error"), "Đã xảy ra lỗi")
        }
      })
    } else if (this.inputConfirm == '') {
      this.checkInputEmpty = true;
      this.checkInputConfirm = false;
    } else {
      this.checkInputEmpty = false;
      this.checkInputConfirm = true;
    }
    this.cdr.detectChanges();
  }
}
