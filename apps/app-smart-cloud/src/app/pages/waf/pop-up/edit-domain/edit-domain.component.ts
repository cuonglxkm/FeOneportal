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
import {
  hostValidator,
  ipValidatorMany,
} from '../../../../../../../../libs/common-utils/src';
import { EditDomainRequest, WafDomain } from '../../waf.model';
import { WafService } from 'src/app/shared/services/waf.service';
import { finalize } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { DOMAIN_REGEX } from 'src/app/shared/constants/constants';

@Component({
  selector: 'one-portal-edit-domain',
  templateUrl: './edit-domain.component.html',
  styleUrls: ['./edit-domain.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDomainComponent implements OnInit {
  @Input() domainData: WafDomain;
  @Output() onOk = new EventEmitter();
  @Input() canClick: boolean;

  isVisible: boolean = false;
  isLoading: boolean = false;

  editDomainRequest = new EditDomainRequest();

  validateForm: FormGroup<{
    ipPublic: FormControl<string>;
    host: FormControl<string>;
    port: FormControl<number>;
  }> = this.fb.group({
    ipPublic: ['', [Validators.required, ipValidatorMany]],
    host: ['', [hostValidator]],
    port: [null as number, [Validators.min(1), Validators.max(65535)]],
    // port: [null as number],
  });

  constructor(
    private fb: NonNullableFormBuilder,
    private wafService: WafService,
    private cdr: ChangeDetectorRef,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {}

  openModal() {
    this.validateForm.controls.ipPublic.setValue(this.domainData.ipPublic, {
      emitEvent: false,
    });
    this.validateForm.controls.host.setValue(this.domainData.host, {
      emitEvent: false,
    });
    this.domainData.port &&
      this.validateForm.controls.port.setValue(this.domainData.port, {
        emitEvent: false,
      });
    this.isVisible = true;
  }

  handleCancelEditDomain() {
    this.isVisible = false;
  }

  onKeyDown(event: KeyboardEvent) {
    // Lấy giá trị của phím được nhấn
    const key = event.key;
    // Kiểm tra xem phím nhấn có phải là một số hoặc phím di chuyển không
    if (
      (isNaN(Number(key)) &&
        key !== 'Backspace' &&
        key !== 'Delete' &&
        key !== 'ArrowLeft' &&
        key !== 'ArrowRight') ||
      key === '.'
    ) {
      // Nếu không phải số hoặc đã nhập dấu chấm và đã có dấu chấm trong giá trị hiện tại
      event.preventDefault(); // Hủy sự kiện để ngăn người dùng nhập ký tự đó
    }
  }

  handleOnEdit() {
    this.isLoading = true;
    const formValues = this.validateForm.getRawValue();
    console.log('formValues', formValues);
    this.editDomainRequest.ipPublic = formValues.ipPublic;
    this.editDomainRequest.port = formValues.port;
    this.editDomainRequest.host = formValues.host;

    this.wafService
      .updateDomain(this.domainData.id, this.editDomainRequest)
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
