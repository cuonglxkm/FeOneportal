import { Component } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import {Location} from "@angular/common";
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import {SecurityGroup} from "../../../core/model/interface/security-group";

@Component({
  selector: 'one-portal-form-rule',
  templateUrl: './form-rule.component.html',
})
export class FormRuleComponent {

  portType: 'Port' | 'PortRange' = "Port";

  remoteType: 'CIDR' | 'SecurityGroup' = "CIDR";

  ruleValue?: string;

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


  validateForm: FormGroup<{
    rule: FormControl<string>;
    portType: FormControl<'Port' | 'PortRange'>;
    portRangeMin: FormControl<number | string>;
    portRangeMax: FormControl<number | string>;
    remoteType: FormControl<'CIDR' | 'SecurityGroup'>;
    remoteIpPrefix: FormControl<null | string>;
    enther: FormControl<'IPV4' | 'IPV6'>;
    protocol: FormControl<any>;
    securityGroup: FormControl<any>;
  }> = this.fb.group({
    rule: ['', [Validators.required]],
    portType: 'Port' as 'Port' | 'PortRange',
    portRangeMin: ['' as number | string, [Validators.required]],
    portRangeMax: ['' as number | string, [Validators.required]],
    remoteType: 'CIDR' as 'CIDR' | 'SecurityGroup',
    remoteIpPrefix: [null as null | string, [Validators.required]],
    enther
      : 'IPV4' as 'IPV4' | 'IPV6',
    protocol: [null as null | string, [Validators.required]],
    securityGroup: [null as null | string, [Validators.required]]
  });

  submitForm(): void {
    if (this.validateForm.valid) {
      // const filteredObject = Object.fromEntries(
      //     Object.entries(this.validateForm.value).filter(([_, value]) => value !== '')
      // )
      console.log(this.validateForm.value);
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
      this.validateForm.controls.portRangeMax.setValue(value)
    }
  }

  ruleChange(type: string) {
    this.ruleValue = type;

  }
  portTypeChange(type: 'Port' | 'PortRange'): void {
    if (type === 'Port') {
      // this.validateForm.controls.protocol.setValidators(Validators.required);
      // this.validateForm.controls.protocol.markAsDirty();
      //
      // this.validateForm.controls.portRangeMin.clearValidators();
      // this.validateForm.controls.portRangeMin.reset();
      // this.validateForm.controls.portRangeMin.markAsPristine();
      //
      // this.validateForm.controls.portRangeMax.clearValidators();
      // this.validateForm.controls.portRangeMax.reset();
      // this.validateForm.controls.portRangeMax.markAsPristine();
    }
    if (type === 'PortRange') {
      // this.validateForm.controls.protocol.clearValidators();
      // this.validateForm.controls.protocol.reset();
      // this.validateForm.controls.protocol.markAsPristine();
      //
      // this.validateForm.controls.portRangeMin.setValidators([Validators.required, Validators.min(1)]);
      // this.validateForm.controls.portRangeMin.markAsDirty();
      //
      // this.validateForm.controls.portRangeMax.setValidators([Validators.required, Validators.min(1)]);
      // this.validateForm.controls.portRangeMax.markAsDirty();
    }
    // this.validateForm.controls.protocol.updateValueAndValidity();
    // this.validateForm.controls.portRangeMin.updateValueAndValidity();
    // this.validateForm.controls.portRangeMax.updateValueAndValidity();

    this.portType = type
  }

  remoteTypeChange(type: 'CIDR' | 'SecurityGroup'): void {
    if (type === 'CIDR') {
      this.validateForm.controls.remoteIpPrefix.setValidators([Validators.required, Validators.min(1)]);
      this.validateForm.controls.remoteIpPrefix.markAsDirty();
    }
    if (type === 'SecurityGroup') {
      this.validateForm.controls.remoteIpPrefix.clearValidators();
      this.validateForm.controls.remoteIpPrefix.reset();
      this.validateForm.controls.remoteIpPrefix.markAsPristine();
    }
    this.validateForm.controls.remoteIpPrefix.updateValueAndValidity();

    this.remoteType = type
  }

  goBack(): void {
    this.location.back();
  }
  constructor(private fb: NonNullableFormBuilder, private location: Location) {}
}
