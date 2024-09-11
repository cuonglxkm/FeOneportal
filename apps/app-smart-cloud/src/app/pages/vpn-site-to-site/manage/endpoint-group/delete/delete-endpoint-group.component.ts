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
import { FormDeleteEndpointGroup } from 'src/app/shared/models/endpoint-group';
import { EndpointGroupService } from 'src/app/shared/services/endpoint-group.service';

@Component({
  selector: 'one-portal-delete-endpoint-group',
  templateUrl: './delete-endpoint-group.component.html',
  styleUrls: ['./delete-endpoint-group.component.less'],
})
export class DeleteEndpointGroupComponent {
  @Input() region: number;
  @Input() project: number;
  @Input() id: string;
  @Input() name: string;
  @Output() onOk = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;

  validateForm: FormGroup<{
    name: FormControl<string>;
  }> = this.fb.group({
    name: [
      '',
      [Validators.required, this.nameEndpointGroupValidator.bind(this)],
    ],
  });

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService,
    private fb: NonNullableFormBuilder,
    private endpointGroupService: EndpointGroupService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  nameEndpointGroupValidator(control: FormControl): { [key: string]: any } | null {
    const name = control.value;
    if (!name) {
      return null;
    }
    if (name !== this.name) {
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
    let formDelete = new FormDeleteEndpointGroup();
    formDelete.id = this.id;
    formDelete.regionId = this.region;
    formDelete.vpcId = this.project;
    console.log(formDelete);

    if (this.validateForm.valid) {
      if (this.name.includes(this.validateForm.controls.name.value)) {
        this.endpointGroupService.deleteEndpointGroup(formDelete).subscribe(
          (data) => {
            if (data) {
              this.isVisible = false;
              this.isLoading = false;
              this.notification.success(
                this.i18n.fanyi('app.status.success'),
                this.i18n.fanyi('app.endpoint-delete.success')
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
                this.i18n.fanyi('app.endpoint-delete.fail2')
              );
            } else {
              this.isVisible = false;
              this.isLoading = false;
              this.notification.error(
                this.i18n.fanyi('app.status.fail'),
                this.i18n.fanyi('app.endpoint-delete.fail')
              );
            }
          }
        );
      }
    }
  }
}
