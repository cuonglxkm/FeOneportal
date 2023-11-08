import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {Location} from "@angular/common";
import {SecurityGroupRule} from "../../../core/model/interface/security-group-rule";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Component({
  selector: 'one-portal-create-inbound',
  templateUrl: './create-inbound.component.html',
  styleUrls: ['./create-inbound.component.less'],
})
export class CreateInboundComponent implements OnInit{

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
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  goBack(): void {
    this._location.back();
  }

  constructor(private fb: NonNullableFormBuilder,  private _location: Location, private http: HttpClient) {
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

  listSecurityGroupRule: SecurityGroupRule[] = [];
  header = new HttpHeaders();
  request_header = this.header.append('token', '123456789');
  ngOnInit(): void {

    this.http.get("http://172.16.68.200:1009/security_group/rule/get_all?userId=669&regionId=3",
        {headers: this.request_header})
        .subscribe((data: any) => {
          this.listSecurityGroupRule = data;
          console.log('data: ' , this.listSecurityGroupRule)
        })
  }
}
