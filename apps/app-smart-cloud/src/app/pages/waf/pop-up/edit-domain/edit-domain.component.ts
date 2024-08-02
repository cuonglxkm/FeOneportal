import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import { ipValidatorMany } from '../../../../../../../../libs/common-utils/src';
import { EditDomainRequest, WafDomain } from '../../waf.model';
import { WafService } from 'src/app/shared/services/waf.service';
import { finalize } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-edit-domain',
  templateUrl: './edit-domain.component.html',
  styleUrls: ['./edit-domain.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDomainComponent {
  @Input() domainData: WafDomain;

  isVisible: boolean = false;
  isLoading: boolean = false;

  editDomainRequest = new EditDomainRequest();

  validateForm: FormGroup<{
    ipPublic: FormControl<string>;
    host: FormControl<string>;
    port: FormControl<string>;
  }> = this.fb.group({
    ipPublic: ['', [Validators.required, ipValidatorMany]],
    host: [''],
    port: [''],
  });

  constructor(
    private fb: NonNullableFormBuilder,
    private wafService: WafService,
    private cdr: ChangeDetectorRef,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private notification: NzNotificationService,
  ) {}

  openModal() {
    this.isVisible = true;
  }

  handleCancelEditDomain() {
    this.isVisible = false;
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
          this.notification.success(this.i18n.fanyi("app.status.success"),"Thông tin domain đã được cập nhật")
          this.isVisible = false
        },
        error:()=>{
          this.notification.error(this.i18n.fanyi("app.status.error"),"Đã có lỗi xảy ra")
        }
      });
  }
}
