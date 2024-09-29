import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors,
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
export class CreateAccessRulePopupComponent implements OnChanges {
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
    port: [{ value: 443, disabled: true }, Validators.required],
    source: ['', [Validators.required,this.notStartWith0000Validator, Validators.pattern(/^(25[0-5]|2[0-4]\d|1\d{2}|\d{1,2})(\.(25[0-5]|2[0-4]\d|1\d{2}|\d{1,2})){3}(\/(3[0-2]|[12]?\d))?$/)]],
  });

  notStartWith0000Validator(control: AbstractControl): ValidationErrors | null {
    const forbidden = control.value?.startsWith('0.0.0.0');
    return forbidden ? { 'startsWith0000': true } : null;
  }

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

  ngOnChanges(changes: SimpleChanges): void {
    console.log("changessssssssssssssssssssssssssssssssss",changes)
    console.log("cc",this.cloudBackup);
  }
  ngOnInit(): void {
    
    console.log("ádasdasd",this.cloudBackup);
  }

  handleCreate() {
    this.isLoading = true;
    console.log("zzz",this.cloudBackup);
    var accessRule = this.form.getRawValue() as CreateAccessRule;
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
