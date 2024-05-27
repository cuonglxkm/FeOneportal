import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
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
    private ikePolicyService: IkePolicyService
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
                'Thành công',
                'Xoá Ike Policy thành công'
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
                'Thất bại',
                'Ike Policy đang được sử dụng'
              );
            } else {
              this.isVisible = false;
              this.isLoading = false;
              this.notification.error('Thất bại', 'Xoá Ike Policy thất bại');
            }
          }
        );
      }
    }
  }
}
