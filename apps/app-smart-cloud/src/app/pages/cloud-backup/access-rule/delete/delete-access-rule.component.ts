import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  Inject,
} from '@angular/core';
import {
  NonNullableFormBuilder,
} from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { Router } from '@angular/router';
import { AccessRule, CloudBackup } from '../../cloud-backup.model';
import { CloudBackupService } from 'src/app/shared/services/cloud-backup.service';

@Component({
  selector: 'one-portal-delete-access-rule',
  templateUrl: './delete-access-rule.component.html',
  styleUrls: ['./delete-access-rule.component.less']
})
export class DeleteAccessRuleComponent {
  @Input() cloudBackup: CloudBackup;
  @Input() accessRuleData: AccessRule;
  @Input() canClick: boolean = true;
  @Output() onOk = new EventEmitter();

  isVisible: boolean = false;
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

  openModal() {
    this.isVisible = true;
  }

  onInputChange(value: string) {
    this.inputConfirm = value;
  }

  handleCancelDeleteDomain() {
    this.inputConfirm = '';
    this.checkInputConfirm = false;
    this.checkInputEmpty = false;
    this.isVisible = false;
  }

  handleOkDelete() {
    this.isLoading = true
    this.cloudBackupService.deleteAccessRule(this.cloudBackup.id, this.accessRuleData.id).pipe(finalize(()=>{
      this.isLoading = false
    })).subscribe({
      next:()=>{
        this.notification.success(this.i18n.fanyi("app.status.success"), "Thao tác thành công")
        this.isVisible = false;
        this.onOk.emit()
      },
      error:()=>{
        this.notification.success(this.i18n.fanyi("app.status.error"), "Đã xảy ra lỗi")
      }
    })
    this.cdr.detectChanges();
  }
}
