import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SecurityGroupService } from '../../../../../shared/services/security-group.service';
import { AppValidator } from '../../../../../../../../../libs/common-utils/src';
import { FormCreateSG } from '../../../../../shared/models/security-group';

@Component({
  selector: 'one-portal-create-security-group',
  templateUrl: './create-security-group.component.html',
  styleUrls: ['./create-security-group.component.less'],
})
export class CreateSecurityGroupComponent {
  @Input() region: number
  @Input() project: number
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()



  isVisible: boolean = false
  isLoading: boolean = false

  validateForm: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
  }> = this.fb.group({
    name: ['', [Validators.required,
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      AppValidator.startsWithValidator('SG_')]],
    description: ['', [Validators.maxLength(500)]]
  });

  constructor(private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private securityGroupService: SecurityGroupService) {
  }
  showModal() {
    this.isVisible = true
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.validateForm.reset()
    this.onCancel.emit()
  }
  handleOk() {
    if(this.validateForm.valid) {
      let formCreateSG = new FormCreateSG()
      formCreateSG.userId = this.tokenService.get()?.userId
      formCreateSG.name = this.validateForm.controls.name.value
      formCreateSG.description = this.validateForm.controls.description.value
      formCreateSG.regionId = this.region
      formCreateSG.projectId = this.project

      this.securityGroupService.createSecurityGroup(formCreateSG).subscribe(data => {
        this.isVisible = false
        this.isLoading = false
        this.notification.success("Thành công", "Tạo mới Security Group thành công")
        this.onOk.emit()
      }, error => {
        this.isVisible = false
        this.isLoading = false
        this.notification.error("Thất bại", "Tạo mới Security Group thất bại")
      })
    }
  }
}
