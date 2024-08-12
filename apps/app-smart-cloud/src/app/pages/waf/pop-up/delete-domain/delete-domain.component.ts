import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  Inject,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NAME_SNAPSHOT_REGEX } from 'src/app/shared/constants/constants';
import { WafService } from 'src/app/shared/services/waf.service';
import { WafDomain } from '../../waf.model';
import { finalize } from 'rxjs';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { Router } from '@angular/router';

@Component({
  selector: 'one-portal-delete-domain',
  templateUrl: './delete-domain.component.html',
  styleUrls: ['./delete-domain.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteDomainComponent {
  @Input() domainData: WafDomain;
  @Input() canClick: boolean;
  @Output() onOk = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;
  inputConfirm: string = '';
  checkInputEmpty: boolean = false;
  checkInputConfirm: boolean = false;

  validateForm: FormGroup<{
    name: FormControl<string>;
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(NAME_SNAPSHOT_REGEX)]],
  });

  constructor(
    private fb: NonNullableFormBuilder,
    private cdr: ChangeDetectorRef,
    private notification: NzNotificationService,
    private wafService: WafService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private router: Router
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
    if (this.inputConfirm == this.domainData.domain) {
      this.isLoading = true
      this.wafService.deleteDomain(this.domainData.id).pipe(finalize(()=>{
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
