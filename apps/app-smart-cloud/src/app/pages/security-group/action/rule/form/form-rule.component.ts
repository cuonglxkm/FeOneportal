import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { SecurityGroup, SecurityGroupSearchCondition } from 'src/app/shared/models/security-group';
import { SecurityGroupRuleCreateForm } from 'src/app/shared/models/security-group-rule';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { SecurityGroupService } from 'src/app/shared/services/security-group.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { SecurityGroupRuleService } from '../../../../../shared/services/security-group-rule.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import { AppValidator } from '../../../../../../../../../libs/common-utils/src';
import { finalize } from 'rxjs/operators';

export function integerInRangeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (value === null || value === undefined || isNaN(value)) {
      return { 'invalid': true };
    }

    console.log('value', value)
    const intValue = parseInt(value, 10);
    if (intValue < min || intValue > max || intValue <= 0) {
      return { 'outOfRange': true };
    }
    return null;
  };
}
@Component({
  selector: 'one-portal-form-rule',
  templateUrl: './form-rule.component.html'
})
export class FormRuleComponent implements OnInit {
  @Input() direction: 'ingress' | 'egress';
  @Input() securityGroupId: string;
  @Input() region: number;
  @Input() project: number;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();


  portType: 'Port' | 'PortRange' = 'Port';

  remoteType: 'CIDR' | 'SecurityGroup' = 'CIDR';

  ruleValue?: string;

  isLoading: boolean = false;

  rulesList: NzSelectOptionInterface[] = [
    { label: 'Custom TCP Rule', value: 'tcp-IPv4' },
    { label: 'Custom UDP Rule', value: 'udp-IPv4' },
    { label: 'Custom ICMP Rule', value: 'icmp-IPv4' },
    { label: 'Other Protocol', value: 'other-IPv4' },
    { label: 'HTTP', value: 'tcp-IPv4-80' },
    { label: 'HTTPS', value: 'tcp-IPv4-443' },
    { label: 'SSH', value: 'tcp-IPv4-22' },
    { label: 'RDP', value: 'tcp-IPv4-3389' },
    { label: 'ICMP', value: 'icmp-IPv4-' },
    { label: 'MYSQL', value: 'tcp-IPv4-3306' },
    { label: 'Any', value: '-IPv4-' }
  ];

  remotesList: NzSelectOptionInterface[] = [
    { label: 'CIDR', value: 'CIDR' },
    { label: 'Security Group', value: 'SecurityGroup' }
  ];

  listSecurityGroup: SecurityGroup[] = [];

  formCreateSGRule: SecurityGroupRuleCreateForm = new SecurityGroupRuleCreateForm();

  validateForm: FormGroup<{
    rule: FormControl<string>;
    portType: FormControl<'Port' | 'PortRange'>;
    portRangeMin: FormControl<number>;
    portRangeMax: FormControl<number>;
    type: FormControl<number>;
    code: FormControl<number>
    remoteType: FormControl<'CIDR' | 'SecurityGroup'>;
    remoteIpPrefix: FormControl<string>;
    etherType: FormControl<string>;
    protocol: FormControl<number>;
    securityGroupId: FormControl<string>;
  }> = this.fb.group({
    rule: ['', [Validators.required]],
    portType: 'Port' as 'Port' | 'PortRange',
    portRangeMin: [1],
    portRangeMax: [1],
    type: [-1 ],
    code: [-1],
    remoteType: 'CIDR' as 'CIDR' | 'SecurityGroup',
    remoteIpPrefix: ['', [AppValidator.ipWithCIDRValidator]],
    etherType: [''],
    protocol: [-1],
    securityGroupId: ['']
  });

  constructor(private fb: NonNullableFormBuilder,
              private securityGroupService: SecurityGroupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private securityGroupRuleService: SecurityGroupRuleService,
              private notification: NzNotificationService,
              private cdr: ChangeDetectorRef,
              private router: Router) {
    this.validateForm.controls.remoteIpPrefix.setValidators([Validators.required, AppValidator.ipWithCIDRValidator])
    this.validateForm.controls.portRangeMin.setValidators([Validators.required, Validators.pattern(/^[1-9]\d{0,4}$|^[1-5]\d{4}$|^6[0-4]\d{3}$|^65[0-4]\d{2}$|^655[0-2]\d$|^6553[0-5]$/), integerInRangeValidator(1, 65535)])
    this.validateForm.controls.portRangeMax.setValidators([Validators.required, Validators.pattern(/^[1-9]\d{0,4}$|^[1-5]\d{4}$|^6[0-4]\d{3}$|^65[0-4]\d{2}$|^655[0-2]\d$|^6553[0-5]$/), integerInRangeValidator(1, 65535), AppValidator.portValidator('portRangeMin')])
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.doCreate();
    }
  }

  ruleChange(type) {
    this.validateForm.controls.portRangeMin.clearValidators();
    this.validateForm.controls.portRangeMin.markAsPristine();
    this.validateForm.controls.portRangeMin.reset();

    this.validateForm.controls.portRangeMax.clearValidators();
    this.validateForm.controls.portRangeMax.markAsPristine();
    this.validateForm.controls.portRangeMax.reset();

    this.validateForm.controls.protocol.clearValidators();
    this.validateForm.controls.protocol.markAsPristine();
    this.validateForm.controls.protocol.reset();

    if (type === 'other-IPv4') {

      this.validateForm.controls.protocol.setValidators([Validators.required, AppValidator.validateProtocol,
        Validators.pattern(/^-?([01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5])$/)]);
      this.validateForm.controls.protocol.markAsDirty();
      this.validateForm.controls.protocol.reset();
    }

    if (type === 'icmp-IPv4') {

      this.validateForm.controls.type.setValidators([Validators.required, AppValidator.validateProtocol,
        Validators.pattern(/^-?([01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5])$/), AppValidator.portValidator('code')])

      this.validateForm.controls.type.markAsDirty();
      this.validateForm.controls.type.reset();

      this.validateForm.controls.code.setValidators([Validators.required, AppValidator.validateProtocol,
        Validators.pattern(/^-?([01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5])$/)])

      this.validateForm.controls.code.markAsDirty();
      this.validateForm.controls.code.reset();
    }

    if (type === 'tcp-IPv4' || type === 'udp-IPv4') {
      this.validateForm.controls.portRangeMin.setValidators([Validators.required, Validators.min(1), integerInRangeValidator(1, 65535)]);
      this.validateForm.controls.portRangeMin.markAsDirty();
      this.validateForm.controls.portRangeMin.reset();

      this.validateForm.controls.portRangeMax.setValidators([Validators.required, integerInRangeValidator(1, 65535), AppValidator.portValidator('portRangeMin')]);
      this.validateForm.controls.portRangeMax.markAsDirty();
      this.validateForm.controls.portRangeMax.reset();
    }


    // this.validateForm.controls.remoteIpPrefix.setValidators(Validators.required)

    this.validateForm.controls.protocol.updateValueAndValidity();
    this.validateForm.controls.portRangeMin.updateValueAndValidity();
    this.validateForm.controls.portRangeMax.updateValueAndValidity();
    this.ruleValue = type;
  }

  remoteTypeChange(type: 'CIDR' | 'SecurityGroup'): void {
    this.remoteType = type;
    if (this.remoteType == 'CIDR') {
      this.validateForm.controls.remoteIpPrefix.setValidators([Validators.required,
        AppValidator.ipWithCIDRValidator])
      this.validateForm.controls.remoteIpPrefix.reset();

      this.validateForm.controls.securityGroupId.clearValidators()
      this.validateForm.controls.securityGroupId.updateValueAndValidity()

      this.validateForm.controls.etherType.clearValidators()
      this.validateForm.controls.securityGroupId.updateValueAndValidity()
    }
    if (this.remoteType == 'SecurityGroup') {
      this.validateForm.controls.remoteIpPrefix.clearValidators()
      this.validateForm.controls.remoteIpPrefix.updateValueAndValidity()

      this.validateForm.controls.securityGroupId.setValidators(Validators.required)
      this.validateForm.controls.etherType.setValidators(Validators.required)
      this.validateForm.controls.securityGroupId.reset();
      this.validateForm.controls.etherType.reset();
    }
    console.log('type=', type);
    console.log('remote type =', this.remoteType);
    console.log(this.validateForm.controls.remoteIpPrefix.valid);
  }

  getSecurityGroup() {
    let conditionSearch = new SecurityGroupSearchCondition()
    conditionSearch.securityGroupId = null
    conditionSearch.userId = this.tokenService.get()?.userId
    conditionSearch.projectId = this.project
    conditionSearch.regionId = this.region
    this.securityGroupService.search(conditionSearch)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.listSecurityGroup = data;
      });
  }

  portTypeChange(type: 'Port' | 'PortRange') {
    this.validateForm.controls.portRangeMin.reset();
    this.validateForm.controls.portRangeMax.reset();
    this.validateForm.controls.portRangeMin.updateValueAndValidity();
    this.validateForm.controls.portRangeMax.updateValueAndValidity();
    this.portType = type;

  }

  isValidNumber(value): boolean {
    console.log('value', value)
    const intValue = parseInt(value, 10);
    // Kiểm tra giá trị có nằm trong khoảng từ 1 đến 65535 không
    return intValue >= 1 && intValue <= 65535;
  }

  portChange(value) {
    console.log('port value', value)
    if (this.portType === 'Port') {
      if(this.isValidNumber(value)) {
        this.validateForm.controls.portRangeMax.setValue(value);
      } else {
        this.validateForm.controls.portRangeMax.setValidators([Validators.required, Validators.pattern(/^[1-9]\d{0,4}$|^[1-5]\d{4}$|^6[0-4]\d{3}$|^65[0-4]\d{2}$|^655[0-2]\d$|^6553[0-5]$/), integerInRangeValidator(1, 65535), AppValidator.portValidator('portRangeMin')])
      }
    }
  }

  updatePortRangeValidator() {
    Promise.resolve().then(() => this.validateForm.controls.portRangeMax.updateValueAndValidity());
  }

  goBack() {
    this.onCancel.emit();
    this.validateForm.reset();
  }

  doCreate() {
    if(this.validateForm.valid) {
      console.log('form', this.validateForm.getRawValue())
      const formData = Object.assign(this.validateForm.value, {
        direction: this.direction,
        projectId: this.project,
        regionId: this.region,
        userId: this.tokenService.get()?.userId
      });
      this.formCreateSGRule.direction = this.direction;
      this.formCreateSGRule.etherType = formData.etherType;
      if(formData.rule.includes('icmp-IPv4')) {
        this.formCreateSGRule.portRangeMin = formData.code
        this.formCreateSGRule.portRangeMax = formData.type
      }
      if (formData.portRangeMin === undefined || formData.portRangeMin === null) {
        this.formCreateSGRule.portRangeMin = 0;
      } else {
        this.formCreateSGRule.portRangeMin = formData.portRangeMin
      }
      if (formData.portRangeMax === undefined || formData.portRangeMax === null) {
        this.formCreateSGRule.portRangeMax = 0;
      } else {
        this.formCreateSGRule.portRangeMax = formData.portRangeMax
      }
      this.formCreateSGRule.protocol = formData.protocol.toString();
      this.formCreateSGRule.remoteIpPrefix = <string>formData.remoteIpPrefix;
      this.formCreateSGRule.rule = formData.rule;
      this.formCreateSGRule.securityGroupId = this.securityGroupId;
      this.formCreateSGRule.remoteType = formData.remoteType;
      if (this.formCreateSGRule.remoteType === 'CIDR') {
        this.formCreateSGRule.remoteGroupId = null;
      }
      if (this.formCreateSGRule.remoteType === 'SecurityGroup') {
        this.formCreateSGRule.remoteGroupId = formData.securityGroupId;
      }
      this.formCreateSGRule.userId = this.tokenService.get()?.userId
      this.formCreateSGRule.projectId = this.project
      this.formCreateSGRule.region = this.region

      this.isLoading = true;
      this.securityGroupRuleService.create(this.formCreateSGRule).subscribe(
        data => {
          // if(data.includes('')) {
          this.isLoading = false;
          this.notification.success('Thành công', 'Tạo mới thành công');
          this.onOk.emit(data);
          // }

        },
        error => {
          this.isLoading = false;
          this.notification.error('Thất bại', error.error.detail);
        }
      );
    } else {
      console.log('abc', this.validateForm)
      console.log('invalid', this.validateForm.getRawValue())
    }
  }
  ngOnInit() {
    this.getSecurityGroup();
  }
}
