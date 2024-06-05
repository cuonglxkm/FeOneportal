import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
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
    private endpointGroupService: EndpointGroupService
  ) {}

  nameEndpointGroupValidator(
    control: FormControl
  ): { [key: string]: any } | null {
    const name = control.value;
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
                'Thành công',
                'Xoá Endpoint Group thành công'
              );
              this.validateForm.reset();
              this.onOk.emit(data);
            }
          },
          (error) => {
            if (error.status === 500) {
              this.isVisible = false;
              this.isLoading = false;
              this.notification.error(
                'Thất bại',
                'Endpoint Group đang được sử dụng'
              );
            } else {
              this.isVisible = false;
              this.isLoading = false;
              this.notification.error(
                'Thất bại',
                'Xoá Endpoint Group thất bại'
              );
            }
          }
        );
      }
    }
  }
}
