import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {Location} from "@angular/common";
import {SecurityGroup, SecurityGroupSearchCondition} from "../../../../core/model/interface/security-group";
import {SecurityGroupRuleService} from "../../../../core/service/security-group-rule.service";

interface RulesList {
  option: string;
  value: string;
}

interface RemotesList {
  option: string;
  value: string;
}

@Component({
  selector: 'one-portal-create-security-group-inbound',
  templateUrl: './create-inbound.component.html',
  styleUrls: ['./create-inbound.component.less'],
})
export class CreateInboundComponent implements OnInit {

  port_type: 'port' | 'port_range' = 'port';

  listSecurityGroup: SecurityGroup[] = [];

  rulesList: RulesList[] = [
    {option: "Custom TCP Rule", value: "tcp-IPv4"},
    {option: "Custom UDP Rule", value: "udp-IPv4"},
    {option: "Custom ICMP Rule", value: "icmp-IPv4"},
    {option: "Other Protocol", value: "other-IPv4"},
    {option: "HTTP", value: "tcp-IPv4-80"},
    {option: "HTTPS", value: "tcp-IPv4-443"},
    {option: "SSH", value: "tcp-IPv4-22"},
    {option: "RDP", value: "tcp-IPv4-3389"},
    {option: "ICMP", value: "icmp-IPv4-"},
    {option: "MYSQL", value: "tcp-IPv4-3306"},
    {option: "Any", value: "-IPv4-"},
  ]

  remotesList: RemotesList[] = [
    {option: "CIDR", value: "CIDR"},
    {option: "Security Group", value: "SecurityGroup"},
  ]

  conditionSearch: SecurityGroupSearchCondition = {
    userId: 669,
    regionId: 3,
    projectId: 4079
  }

  validateForm: FormGroup<{
    rule: FormControl<string | null>;
    remoteGroupId: FormControl<string>;
    port_type: FormControl<'port' | 'port_range'>;
    remoteIpPrefix: FormControl<string>;
    port: FormControl<string>;
    etherType: FormControl<'ipv4' | 'ipv6'>;
    portRangeMin: FormControl<string>;
    securityGroupId: FormControl<string>;
    portRangeMax: FormControl<string>;
  }>;

  constructor(private fb: NonNullableFormBuilder,
              private _location: Location,
              private securityGroupRuleService: SecurityGroupRuleService) {
    this.validateForm = this.fb.group({
      rule: ['', [Validators.required]],
      remoteGroupId: ['', [Validators.required]],
      port_type: this.fb.control<'port' | 'port_range'>('port', [Validators.required]),
      etherType: this.fb.control<'ipv4' | 'ipv6'>('ipv4', [Validators.required]),
      remoteIpPrefix: [''],
      port: [''],
      portRangeMin: [''],
      securityGroupId: [''],
      portRangeMax: ['']
    });
  }

  portChange(value: 'port' | 'port_range'): void {
    this.port_type = value
    if (value === 'port') {
      console.log('a');
      this.validateForm.controls.remoteIpPrefix.setValidators(Validators.required);
      this.validateForm.controls.remoteIpPrefix.markAsDirty();
      this.validateForm.controls.port.setValidators(Validators.required);
      this.validateForm.controls.port.markAsDirty();
    }
    if (value === 'port_range') {
      console.log('b');
      this.validateForm.controls.port.clearValidators();
      this.validateForm.controls.port.markAsPristine();
      this.validateForm.controls.remoteIpPrefix.clearValidators();
      this.validateForm.controls.remoteIpPrefix.markAsPristine();
    }
    this.validateForm.controls.port.updateValueAndValidity();
    this.validateForm.controls.remoteIpPrefix.updateValueAndValidity();
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      console.log("value", this.validateForm.value);
      this.validateForm.patchValue({

      })
      // this.securityGroupRuleService.create(this.validateForm.value, this.conditionSearch).subscribe((data) => {
      //   this.message.create('success', `Đã thêm thành công`);
      //   this.router.navigate([
      //     '/app-smart-cloud/security-group'
      //   ])
      // })
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({onlySelf: true});
        }
      });
    }
  }

  goBack(): void {
    this._location.back();
  }
  ngOnInit(): void {}
}
