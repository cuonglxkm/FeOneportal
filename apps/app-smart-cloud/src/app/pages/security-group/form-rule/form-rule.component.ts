import {Component, Inject, Input, OnInit} from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import {Location} from "@angular/common";
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import {SecurityGroup, SecurityGroupSearchCondition} from "../../../shared/models/security-group";
import {SecurityGroupService} from "../../../shared/services/security-group.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {AppValidator} from "../../../../../../../libs/common-utils/src";
import {SecurityGroupRuleService} from "../../../shared/services/security-group-rule.service";
import {SecurityGroupRuleCreateForm} from "../../../shared/models/security-group-rule";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {Router} from "@angular/router";

@Component({
  selector: 'one-portal-form-rule',
  templateUrl: './form-rule.component.html',
})
export class FormRuleComponent implements OnInit{

  @Input() direction: 'ingress' | 'egress'
  @Input() securityGroupId: string

  portType: 'Port' | 'PortRange' = "Port";

  remoteType: 'CIDR' | 'SecurityGroup' = "CIDR";

  ruleValue?: string;

  directionValue: any;

  rulesList: NzSelectOptionInterface[] = [
    {label: "Custom TCP Rule", value: "tcp-IPv4"},
    {label: "Custom UDP Rule", value: "udp-IPv4"},
    {label: "Custom ICMP Rule", value: "icmp-IPv4"},
    {label: "Other Protocol", value: "other-IPv4"},
    {label: "HTTP", value: "tcp-IPv4-80"},
    {label: "HTTPS", value: "tcp-IPv4-443"},
    {label: "SSH", value: "tcp-IPv4-22"},
    {label: "RDP", value: "tcp-IPv4-3389"},
    {label: "ICMP", value: "icmp-IPv4-"},
    {label: "MYSQL", value: "tcp-IPv4-3306"},
    {label: "Any", value: "-IPv4-"},
  ]

  remotesList: NzSelectOptionInterface[] = [
    {label: "CIDR", value: "CIDR"},
    {label: "Security Group", value: "SecurityGroup"},
  ]

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
  }> = this.fb.group({
    rule: ['', [Validators.required]],
    portType: 'Port' as 'Port' | 'PortRange',
    portRangeMin: [null as number | string | null, [Validators.required, AppValidator.validPort]],
    portRangeMax: [null as number | string | null, [Validators.required]],
    remoteType: 'CIDR' as 'CIDR' | 'SecurityGroup',
    remoteIpPrefix: [null as null | string | number, [Validators.required, AppValidator.ipWithCIDRValidator,
    Validators.pattern( /^(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}\/\d{1,2}$/)]],
    etherType: [null as null | string],
    protocol: [null as null | string],
    securityGroupId: [null as null | string]
  });

  submitForm(): void {
    if (this.validateForm.valid) {
      const formData = Object.assign(this.validateForm.value, {
        direction: this.direction,
        projectId: this.conditionSearch.projectId,
        regionId: this.conditionSearch.regionId,
        userId: this.conditionSearch.userId,
      })
      console.log(formData);
      this.formCreateSGRule.direction = this.direction;
      this.formCreateSGRule.etherType = formData.etherType
      if(formData.portRangeMin === undefined || formData.portRangeMin === null) {
        this.formCreateSGRule.portRangeMin = 0;
      } else {
        this.formCreateSGRule.portRangeMin = parseInt(<string>formData.portRangeMin, 10)
      }
      if(formData.portRangeMax === undefined || formData.portRangeMax === null) {
        this.formCreateSGRule.portRangeMax = 0;
      } else {
        this.formCreateSGRule.portRangeMax = parseInt(<string>formData.portRangeMax, 10)
      }
      this.formCreateSGRule.protocol = formData.protocol
      this.formCreateSGRule.remoteIpPrefix = <string>formData.remoteIpPrefix
      this.formCreateSGRule.rule = formData.rule
      this.formCreateSGRule.securityGroupId = this.securityGroupId
      this.formCreateSGRule.remoteType = formData.remoteType
      if(this.formCreateSGRule.remoteType === 'CIDR') {
        this.formCreateSGRule.remoteGroupId = null;
      }
      if(this.formCreateSGRule.remoteType === 'SecurityGroup') {
        this.formCreateSGRule.remoteGroupId = formData.securityGroupId;
      }
      this.formCreateSGRule.userId = this.conditionSearch.userId;
      this.formCreateSGRule.projectId = this.conditionSearch.projectId
      this.formCreateSGRule.region =this.conditionSearch.regionId

      console.log('request: ', this.formCreateSGRule)
      this.securityGroupRuleService.create(this.formCreateSGRule).subscribe(
        data => {
          console.log('response: ', data)
          this.notification.success('Thành công', 'Đã tạo Inbound thành công');
          this.router.navigate([
            '/app-smart-cloud/security-group'
          ])
        },
        error => {
          this.notification.error('Thất bại', 'Tạo Inbound thất bại');
        }
      )
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  // bindingData(formData) : SecurityGroupRuleCreateForm {
  //
  //   return this.form;
  // }
  portChange(value: string) {
    if (this.portType === 'Port') {
      this.validateForm.controls.portRangeMax.setValue(value)
    }
  }

  ruleChange(type: string) {
    if (type === 'other-IPv4') {
      this.validateForm.controls.protocol.setValidators([Validators.required]);
      this.validateForm.controls.protocol.markAsDirty();
      this.validateForm.controls.protocol.reset();

      this.validateForm.controls.portRangeMin.clearValidators();
      this.validateForm.controls.portRangeMin.markAsPristine();
      this.validateForm.controls.portRangeMin.reset();

      this.validateForm.controls.portRangeMax.clearValidators();
      this.validateForm.controls.portRangeMax.markAsPristine();
      this.validateForm.controls.portRangeMax.reset();
    } else {

      if (type === '-IPv4-' || type === 'tcp-IPv4-80' || type === 'tcp-IPv4-443'
        || type === 'tcp-IPv4-22' || type === 'tcp-IPv4-3389' || type === 'icmp-IPv4-'
        || type === 'tcp-IPv4-3306') {
        this.validateForm.controls.portRangeMin.clearValidators();
        this.validateForm.controls.portRangeMin.markAsPristine();
        this.validateForm.controls.portRangeMin.reset();

        this.validateForm.controls.portRangeMax.clearValidators();
        this.validateForm.controls.portRangeMax.markAsPristine();
        this.validateForm.controls.portRangeMax.reset();
      } else {
        this.validateForm.controls.portRangeMin.setValidators([Validators.required]);
        this.validateForm.controls.portRangeMin.markAsDirty();
        this.validateForm.controls.portRangeMin.reset();

        this.validateForm.controls.portRangeMax.setValidators([Validators.required]);
        this.validateForm.controls.portRangeMax.markAsDirty();
        this.validateForm.controls.portRangeMax.reset();
      }

      this.validateForm.controls.protocol.clearValidators();
      this.validateForm.controls.protocol.markAsPristine();
      this.validateForm.controls.protocol.reset();
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
    this.portType = type
  }

  remoteTypeChange(type: 'CIDR' | 'SecurityGroup'): void {
    if (type === 'CIDR') {
      this.validateForm.controls.remoteIpPrefix.setValidators([Validators.required, Validators.min(1),
        AppValidator.ipWithCIDRValidator]);
      this.validateForm.controls.remoteIpPrefix.markAsDirty();
      this.validateForm.controls.remoteIpPrefix.reset();

      this.validateForm.controls.securityGroupId.clearValidators();
      this.validateForm.controls.securityGroupId.markAsPristine();
      this.validateForm.controls.securityGroupId.reset();

      this.validateForm.controls.etherType.clearValidators();
      this.validateForm.controls.etherType.markAsPristine();
      this.validateForm.controls.etherType.reset();
    }
    if (type === 'SecurityGroup') {
      this.validateForm.controls.remoteIpPrefix.clearValidators();
      this.validateForm.controls.remoteIpPrefix.markAsPristine();
      this.validateForm.controls.remoteIpPrefix.reset();

      this.validateForm.controls.securityGroupId.setValidators([Validators.required]);
      this.validateForm.controls.securityGroupId.markAsDirty();
      this.validateForm.controls.securityGroupId.reset();

      this.validateForm.controls.etherType.setValidators([Validators.required]);
      this.validateForm.controls.etherType.markAsDirty();
      this.validateForm.controls.etherType.reset();
    }
    this.validateForm.controls.remoteIpPrefix.updateValueAndValidity();
    this.validateForm.controls.securityGroupId.updateValueAndValidity();
    this.validateForm.controls.etherType.updateValueAndValidity();

    this.remoteType = type
  }

  getSecurityGroup() {
    this.securityGroupService.search(this.conditionSearch)
      .subscribe((data) => {
        this.listSecurityGroup = data;
      })
  }

  goBack(): void {
    this.location.back();
  }
  constructor(
    private fb: NonNullableFormBuilder,
    private location: Location,
    private securityGroupService: SecurityGroupService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private securityGroupRuleService: SecurityGroupRuleService,
    private notification: NzNotificationService,
    private router: Router) {}

  ngOnInit() {
    this.conditionSearch.projectId = 4079
    this.conditionSearch.regionId = 3
    this.conditionSearch.userId = this.tokenService.get()?.userId
    this.getSecurityGroup()
  }
}
