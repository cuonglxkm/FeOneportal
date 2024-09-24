import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { IP_ADDRESS_REGEX } from 'src/app/shared/constants/constants';
import { AccessRule } from '../../cloud-backup.model';
import { CloudBackupService } from 'src/app/shared/services/cloud-backup.service';

@Component({
  selector: 'one-portal-edit-access-rule',
  templateUrl: './edit-access-rule.component.html',
  styleUrls: ['./edit-access-rule.component.less'],
})
export class EditAccessRuleComponent implements OnInit {
  @Input() accessRule: AccessRule;
  @Input() canClick: boolean = true;
  @Output() onOk = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;
  form: FormGroup<{
    port: FormControl<number>;
    source: FormControl<string>;
  }> = this.fb.group({
    port: [null],
    source: ['', [Validators.required, Validators.pattern(IP_ADDRESS_REGEX)]]
  });

  constructor(
    private fb: NonNullableFormBuilder,
    private cloudBackupService: CloudBackupService,
    private cdr: ChangeDetectorRef,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {}

  openModal() {
    this.form.patchValue({
      port: this.accessRule.port,
      source: this.accessRule.source
    })
    this.isVisible = true;
  }

  closeModal() {
    this.isVisible = false;
  }

  handleEdit() {
    this.isLoading = true;
    const formValues = this.form.getRawValue();
    this.cloudBackupService
      .updateAccessRule(null)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
            'Thông tin domain đã được cập nhật'
          );
          this.isVisible = false;
          this.onOk.emit();
        },
        error: () => {
          this.notification.error(
            this.i18n.fanyi('app.status.error'),
            'Đã có lỗi xảy ra'
          );
        },
      });
  }
}
