import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { SslCertDTO } from '../../waf.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WafService } from 'src/app/shared/services/waf.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-associate-ssl-domain',
  templateUrl: './associate-ssl-domain.component.html',
  styleUrls: ['./associate-ssl-domain.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssociateSslDomainComponent {
  @Input() sslCertData: SslCertDTO;
  @Input() isVisible: boolean;
  @Output() onCancelVisible = new EventEmitter();
  @Output() onOk = new EventEmitter();

  // isVisible: boolean = false;
  isLoading: boolean = false;
  inputConfirm: string = '';
  checkInputEmpty: boolean = false;
  checkInputConfirm: boolean = false;

  form: FormGroup = this.fb.group({
    listDomainIds: [[] as number[], Validators.required],
  });

  constructor(
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private wafService: WafService,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {}

  openModal() {
    this.isVisible = true;
  }

  onInputChange(value: string) {
    this.inputConfirm = value;
  }

  handleCancel() {
    this.onCancelVisible.emit();
  }

  handleOk() {
    this.isLoading = true;
    const formValues = this.form.getRawValue();
    this.wafService
      .associateDomains(formValues.listDomainIds, this.sslCertData.id)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.onOk.emit();
          this.onCancelVisible.emit();
          this.cdr.detectChanges()
        },
        error:(err)=> {
          this.isLoading = false;
          this.notification.error(
            this.i18n.fanyi("app.status.fail"),
            err.error.message
          )
          this.cdr.detectChanges()
        },
      });
  }
}
