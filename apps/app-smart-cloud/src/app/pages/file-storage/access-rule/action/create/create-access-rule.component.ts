import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { NetWorkModel } from '../../../../../shared/models/vlan.model';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormCreateAccessRule } from '../../../../../shared/models/access-rule.model';
import { AccessRuleService } from '../../../../../shared/services/access-rule.service';

@Component({
  selector: 'one-portal-create-access-rule',
  templateUrl: './create-access-rule.component.html',
  styleUrls: ['./create-access-rule.component.less']
})
export class CreateAccessRuleComponent {
  @Input() region: number;
  @Input() project: number;
  @Input() shareCloudId: string;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;

  listNetwork: NetWorkModel[] = [];
  validateForm: FormGroup<{
    accessTo: FormControl<string>
    accessLevel: FormControl<string>
  }> = this.fb.group({
    accessTo: ['', [Validators.required, Validators.pattern('^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$')]],
    accessLevel: ['', [Validators.required]]
  });

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder,
              private accessRuleService: AccessRuleService) {
  }

  showModalCreate() {
    this.isVisible = true;
  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.validateForm.reset();
    this.onCancel.emit();
  }

  submitForm() {
    if (this.validateForm.valid) {
      this.isLoading = true;
      let formCreate = new FormCreateAccessRule();
      formCreate.shareId = this.shareCloudId;
      formCreate.access_type = 'ip';
      formCreate.access_to = this.validateForm.controls.accessTo.value;
      formCreate.access_key = '';
      formCreate.access_level = this.validateForm.controls.accessLevel.value;
      formCreate.vpcId = this.project;
      formCreate.regionId = this.region;
      formCreate.customerId = this.tokenService.get()?.userId;

      this.accessRuleService.createAccessRule(formCreate).subscribe(data => {
        this.isVisible = false;
        this.isLoading = false;
        this.notification.success('Thành công', 'Tạo mới access rule thành công');
        this.onOk.emit();
      }, error => {
        this.isVisible = false;
        this.isLoading = false;
        this.notification.error('Thất bại', 'Tạo mới access rule thất bại');
      });
    }

  }

}
