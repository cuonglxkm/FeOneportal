import {
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { IP_ADDRESS_REGEX} from 'src/app/shared/constants/constants';
import { CloudBackupService } from 'src/app/shared/services/cloud-backup.service';
import { AccessRule, CloudBackup, CreateAccessRule } from '../../cloud-backup.model';

@Component({
  selector: 'one-portal-create-access-rule',
  templateUrl: './create-access-rule.component.html',
  styleUrls: ['./create-access-rule.component.less'],
})
export class CreateAccessRulePopupComponent {
  @Input() isVisibleCreateAccessRule: boolean;
  @Input() cloudBackup: CloudBackup;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();
  isLoading: boolean = false;
  value: string;

  form: FormGroup<{
    port: FormControl<number>;
    source: FormControl<string>;
  }> = this.fb.group({
    port: [443, Validators.required],
    source: ['', [Validators.required, Validators.pattern(IP_ADDRESS_REGEX)]],
  });


  constructor(
    private fb: NonNullableFormBuilder,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private cloudBackupService: CloudBackupService
  ) {}

  handleCancelCreateAccessRule(){
    this.form.reset()
    this.onCancel.emit(false)
  }

  ngOnInit(): void {
    
  }

  async handleCreate() {
    this.isLoading = true;
    var accessRule = this.form.value as CreateAccessRule;
    this.cloudBackupService.createAccessRule(this.cloudBackup.id, accessRule).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.notification.success(
          this.i18n.fanyi('app.status.success'),
          'Tạo mới ssl cert thành công'
        );
        this.form.reset()
        this.onOk.emit(data);
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
  }
}
