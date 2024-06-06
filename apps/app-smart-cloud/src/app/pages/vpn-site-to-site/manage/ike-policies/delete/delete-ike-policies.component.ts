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
import { FormDeleteIKEPolicy } from 'src/app/shared/models/vpns2s.model';
import { IkePolicyService } from 'src/app/shared/services/ike-policy.service';

@Component({
  selector: 'one-portal-delete-ike-policies',
  templateUrl: './delete-ike-policies.component.html',
  styleUrls: ['./delete-ike-policies.component.less'],
})
export class DeleteIkePoliciesComponent {
  @Input() region;
  number;
  @Input() project: number;
  @Input() ikepolicyid: string;
  @Input() nameIkePolicy: string;
  @Output() onOk = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;

  validateForm: FormGroup<{
    name: FormControl<string>;
  }> = this.fb.group({
    name: ['', [Validators.required, this.nameIkePolicyValidator.bind(this)]],
  });

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService,
    private fb: NonNullableFormBuilder,
    private ikePolicyService: IkePolicyService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  nameIkePolicyValidator(control: FormControl): { [key: string]: any } | null {
    const name = control.value;
    if (name !== this.nameIkePolicy) {
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
    this.validateForm.reset()
  }

  handleOk() {
    this.isLoading = true;
    let formDelete = new FormDeleteIKEPolicy();
    formDelete.cloudId = this.ikepolicyid;
    formDelete.regionId = this.region;
    formDelete.projectId = this.project;
    console.log(formDelete);

    if (this.validateForm.valid) {
      if (this.nameIkePolicy.includes(this.validateForm.controls.name.value)) {
        this.ikePolicyService.deleteIkePolicy(formDelete).subscribe(
          (data) => {
            if (data) {
              this.isVisible = false;
              this.isLoading = false;
              this.notification.success(
                this.i18n.fanyi('app.status.success'),
              this.i18n.fanyi('app.ike.policy-delete.success')
              );
              this.validateForm.reset()
              this.onOk.emit(data);
            }
          },
          (error) => {
            if (error.status === 500) {
              this.isVisible = false;
              this.isLoading = false;
              this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.ike.policy-delete.fail2')
              );
            } else {
              this.isVisible = false;
              this.isLoading = false;
              this.notification.error(this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.ike.policy-delete.fail'));
            }
          }
        );
      }
    }
  }
}
