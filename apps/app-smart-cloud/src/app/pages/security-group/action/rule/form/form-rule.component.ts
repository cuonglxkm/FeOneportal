import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { SecurityGroup, SecurityGroupSearchCondition } from 'src/app/shared/models/security-group';
import { SecurityGroupRuleCreateForm } from 'src/app/shared/models/security-group-rule';
import { AppValidator } from '../../../../../../../../../libs/common-utils/src';
import { SecurityGroupService } from '../../../../../shared/services/security-group.service';
import { SecurityGroupRuleService } from '../../../../../shared/services/security-group-rule.service';

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

  prefixIp: string[] = [];
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

  conditionSearch: SecurityGroupSearchCondition = new SecurityGroupSearchCondition();
  formCreateSGRule: SecurityGroupRuleCreateForm = new SecurityGroupRuleCreateForm();

  validateForm: FormGroup<{
    rule: FormControl<string>;
    portType: FormControl<'Port' | 'PortRange'>;
    portRangeMin: FormControl<number | string | null>;
    portRangeMax: FormControl<number | string | null>;
    remoteType: FormControl<'CIDR' | 'SecurityGroup'>;
    remoteIpPrefix: FormControl<null | number | string>;
    etherType: FormControl<null | string>;
    protocol: FormControl<any>;
    securityGroupId: FormControl<null | string>;
  }>;

  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.prefixIp && this.prefixIp.includes(value)) {
      return { duplicatePrefix: true }; // Duplicate name found
    } else {
      return null; // Name is unique
    }
  }

  updatePortRangeValidator(): void {
    Promise.resolve().then(() => this.validateForm.controls.portRangeMax.updateValueAndValidity());
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      const formData = Object.assign(this.validateForm.value, {
        direction: this.direction,
        projectId: this.project,
        regionId: this.region,
        userId: this.conditionSearch.userId
      });
      this.formCreateSGRule.direction = this.direction;
      this.formCreateSGRule.etherType = formData.etherType;
      if (formData.portRangeMin === undefined || formData.portRangeMin === null) {
        this.formCreateSGRule.portRangeMin = 0;
      } else {
        this.formCreateSGRule.portRangeMin = parseInt(<string>formData.portRangeMin, 10);
      }
      if (formData.portRangeMax === undefined || formData.portRangeMax === null) {
        this.formCreateSGRule.portRangeMax = 0;
      } else {
        this.formCreateSGRule.portRangeMax = parseInt(<string>formData.portRangeMax, 10);
      }
      this.formCreateSGRule.protocol = formData.protocol;
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
      this.formCreateSGRule.userId = this.conditionSearch.userId;
      this.formCreateSGRule.projectId = this.conditionSearch.projectId;
      this.formCreateSGRule.region = this.conditionSearch.regionId;

      this.isLoading = true;
      this.securityGroupRuleService.create(this.formCreateSGRule).subscribe(
        data => {
          this.isLoading = false;
          this.notification.success('Thành công', 'Tạo mới thành công');
          this.onOk.emit(data);
        },
        error => {
          this.isLoading = false;
          this.notification.error('Thất bại', 'Tạo mới thất bại');
        }
      );
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  portChange(value: string) {
    if (this.portType === 'Port') {
      this.validateForm.controls.portRangeMax.setValue(value);
    }
  }

  ruleChange(type: string) {

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
      this.validateForm.controls.protocol.setValidators([Validators.required, AppValidator.validateNumber, AppValidator.validateProtocol]);
      this.validateForm.controls.protocol.markAsDirty();
      this.validateForm.controls.protocol.reset();
    }

    if (type === 'icmp-IPv4') {
      this.validateForm.controls.portRangeMin.setValidators([Validators.required, AppValidator.validateNumber, AppValidator.validCodeAndType]);
      this.validateForm.controls.portRangeMin.markAsDirty();
      this.validateForm.controls.portRangeMin.reset();

      this.validateForm.controls.portRangeMax.setValidators([Validators.required, AppValidator.validateNumber, AppValidator.validCodeAndType]);
      this.validateForm.controls.portRangeMax.markAsDirty();
      this.validateForm.controls.portRangeMax.reset();
    }

    if (type === 'tcp-IPv4' || type === 'udp-IPv4') {
      this.validateForm.controls.portRangeMin.setValidators([Validators.required, Validators.min(1), AppValidator.validateNumber]);
      this.validateForm.controls.portRangeMin.markAsDirty();
      this.validateForm.controls.portRangeMin.reset();

      this.validateForm.controls.portRangeMax.setValidators([Validators.required, AppValidator.validateNumber, this.validatePortRange]);
      this.validateForm.controls.portRangeMax.markAsDirty();
      this.validateForm.controls.portRangeMax.reset();
    }

    this.validateForm.controls.protocol.updateValueAndValidity();
    this.validateForm.controls.portRangeMin.updateValueAndValidity();
    this.validateForm.controls.portRangeMax.updateValueAndValidity();
    this.ruleValue = type;

  }

  portTypeChange(type: 'Port' | 'PortRange'): void {
    this.validateForm.controls.portRangeMin.reset();
    this.validateForm.controls.portRangeMax.reset();
    this.validateForm.controls.portRangeMin.updateValueAndValidity();
    this.validateForm.controls.portRangeMax.updateValueAndValidity();
    this.portType = type;
  }

  remoteTypeChange(type: 'CIDR' | 'SecurityGroup'): void {
    this.remoteType = type;
    if (this.remoteType == 'CIDR') {
      this.validateForm.controls.remoteIpPrefix.reset();
    }
    if (this.remoteType == 'SecurityGroup') {
      this.validateForm.controls.securityGroupId.reset();
      this.validateForm.controls.etherType.reset();
    }
    console.log('type=', type);
    console.log('remote type =', this.remoteType);
    console.log(this.validateForm.controls.remoteIpPrefix.valid);
  }

  listInbound = [];
  listOutbound = [];

  getSecurityGroup() {
    this.securityGroupService.search(this.conditionSearch)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.listSecurityGroup = data;

        this.listSecurityGroup.forEach(item => {
          this.listInbound = item?.rulesInfo.filter(value => value.direction === 'ingress');

          this.listInbound.forEach(item1 => {
            this.prefixIp?.push(item1.prefixIp)
          })

          this.listOutbound = item?.rulesInfo.filter(value => value.direction === 'egress');
          this.listOutbound.forEach(item2 => {
            this.prefixIp?.push(item2.prefixIp)
          })
        });
      });
  }

  goBack(): void {
    this.onCancel.emit();
    this.validateForm.reset();
  }

  constructor(
    private fb: NonNullableFormBuilder,
    private securityGroupService: SecurityGroupService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private securityGroupRuleService: SecurityGroupRuleService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router) {
    this.validateForm = this.fb.group({
      rule: ['', [Validators.required]],
      portType: 'Port' as 'Port' | 'PortRange',
      portRangeMin: [null as number | string | null,
        [Validators.required, Validators.min(1),
          Validators.pattern('^[1-9][0-9]{0,4}$'),
          AppValidator.validateNumber]],
      portRangeMax: [null as number | string | null,
        [Validators.required,
          Validators.pattern(/^[1-9][0-9]{0,4}$/),
          this.validatePortRange.bind(this),
          Validators.max(65535)]],
      remoteType: 'CIDR' as 'CIDR' | 'SecurityGroup',
      remoteIpPrefix: [null as null | string | number,
        [Validators.required,
          AppValidator.ipWithCIDRValidator,
          this.duplicateNameValidator.bind(this),
          Validators.pattern('^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(3[0-2]|[0-9]|[12][0-9])$')]],
      etherType: [null as null | string],
      protocol: [null as null | string],
      securityGroupId: [null as null | string]
    });
  }

  validatePortRange: ValidatorFn = (control: AbstractControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value < this.validateForm.controls.portRangeMin.value) {
      return { invalidPortRange: true };
    } else if (control.value > 65535) {
      return { invalidPortRange: true };
    }
    return null;
  };

  ngOnInit() {
    this.conditionSearch.projectId = parseInt(String(this.project));
    this.conditionSearch.regionId = parseInt(String(this.region));
    this.conditionSearch.userId = this.tokenService.get()?.userId;
    this.getSecurityGroup();
  }
}
