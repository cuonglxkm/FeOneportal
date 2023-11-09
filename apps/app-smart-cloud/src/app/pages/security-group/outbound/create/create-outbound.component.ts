import { Component } from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {Location} from "@angular/common";

@Component({
  selector: 'one-portal-outbound',
  templateUrl: './create-outbound.component.html',
  styleUrls: ['./create-outbound.component.less'],
})
export class CreateOutboundComponent {
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

  constructor(private fb: NonNullableFormBuilder,  private _location: Location) {
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
}
