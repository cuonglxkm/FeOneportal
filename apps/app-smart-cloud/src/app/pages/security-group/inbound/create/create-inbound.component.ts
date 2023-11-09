import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {Location} from "@angular/common";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {SecurityGroup} from "../../../../core/model/interface/security-group";

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
  validateForm: FormGroup<{
    rule: FormControl<string | null>;
    remote: FormControl<string>;
    port_type: FormControl<'port' | 'port_range'>;
    remote_ip: FormControl<string>;
    port: FormControl<string>;
    enther: FormControl<'ipv4' | 'ipv6'>;
    from: FormControl<string>;
    security: FormControl<string>;
    to: FormControl<string>;
  }>;

  portChange(value: 'port' | 'port_range'): void {
    this.port_type = value
    // this.validateForm.controls.note.setValue(value === 'male' ? 'Hi, man!' : 'Hi, lady!');
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      console.log('submit', this.validateForm.value);
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

  constructor(private fb: NonNullableFormBuilder, private _location: Location, private http: HttpClient) {
    this.validateForm = this.fb.group({
      rule: ['', [Validators.required]],
      remote: ['', [Validators.required]],
      port_type: this.fb.control<'port' | 'port_range'>('port', [Validators.required]),
      enther: this.fb.control<'ipv4' | 'ipv6'>('ipv4', [Validators.required]),
      remote_ip: [''],
      port: [''],
      from: [''],
      security: [''],
      to: ['']
    });
  }

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

  header = new HttpHeaders();
  request_header = this.header.append('token', '123456789');

  ngOnInit(): void {

    this.http.get("http://172.16.68.200:1009/security_group/get_all?userId=669&regionId=3&projectId=4079",
      {headers: this.request_header})
      .subscribe((data: any) => {
        this.listSecurityGroup = data;
        console.log('data: ', this.listSecurityGroup)
      })
  }
}
