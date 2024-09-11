import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormDeleteIpsecPolicy } from 'src/app/shared/models/ipsec-policy';
import { IpsecPolicyService } from 'src/app/shared/services/ipsec-policy.service';

@Component({
  selector: 'one-portal-delete-ipsec-policies',
  templateUrl: './ipsec-policies.component.html',
  styleUrls: ['./ipsec-policies.component.less'],
})
export class DeleteIpsecPoliciesComponent {
  @Input() region;
  number;
  @Input() project: number;
  @Input() ipsecpolicyid: string;
  @Input() nameIpsecPolicy: string;
  @Output() onOk = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;

  validateForm: FormGroup<{
    name: FormControl<string>;
  }> = this.fb.group({
    name: ['', [Validators.required, this.nameIpsecPolicyValidator.bind(this)]],
  });

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService,
    private fb: NonNullableFormBuilder,
    private ipsecPolicyService: IpsecPolicyService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  nameIpsecPolicyValidator(control: FormControl): { [key: string]: any } | null {
    const name = control.value;
    if (!name) {
      return null;
    }
    if (name !== this.nameIpsecPolicy) {
      return { nameMismatch: true };
    }
    return null;
  }

  showModal() {
    this.isVisible = true;
  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.validateForm.reset();
  }

  handleOk() {
    this.isLoading = true;
    let formDelete = new FormDeleteIpsecPolicy();
    formDelete.id = this.ipsecpolicyid;
    formDelete.regionId = this.region;
    formDelete.vpcId = this.project;
    console.log(formDelete);

    if (this.validateForm.valid) {
      if (
        this.nameIpsecPolicy.includes(this.validateForm.controls.name.value)
      ) {
        this.ipsecPolicyService.deleteIpsecPolicy(formDelete).subscribe(
          (data) => {
            if (data) {
              this.isVisible = false;
              this.isLoading = false;
              this.notification.success(
                this.i18n.fanyi('app.status.success'),
                this.i18n.fanyi('app.ipsec.policy-delete.success')
              );
              this.validateForm.reset();
              this.onOk.emit(data);
            }
          },
          (error) => {
            this.validateForm.reset()
            if (error.status === 500) {
              this.isVisible = false;
              this.isLoading = false;
              this.notification.error(
                this.i18n.fanyi('app.status.fail'),
                this.i18n.fanyi('app.ipsec.policy-delete.fail2')
              );
            } else {
              this.isVisible = false;
              this.isLoading = false;
              this.notification.error( this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.ipsec.policy-delete.fail'));
            }
          }
        );
      }
    }
  }
}
