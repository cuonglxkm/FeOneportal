import { Component, Inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { VlanService } from '../../../../shared/services/vlan.service';
import { CatalogService } from '../../../../shared/services/catalog.service';
import { LoadBalancerService } from '../../../../shared/services/load-balancer.service';

export function ipAddressValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const ipAddressList = control.value.split(',').map(ip => ip.trim()); // Tách các địa chỉ IP theo dấu (,)

    for (const ipAddress of ipAddressList) {
      if (!isValidIPAddress(ipAddress)) {
        return { 'invalidIPAddress': { value: ipAddress } }; // Địa chỉ IP không hợp lệ
      }
    }

    return null; // Địa chỉ IP hợp lệ
  };
}

function isValidIPAddress(ipAddress: string): boolean {
  // Kiểm tra xem địa chỉ IP có thuộc các dải cho phép không
  if (
    !ipAddress.startsWith('10.') &&
    !(ipAddress.startsWith('172.') && ipAddress >= '172.16.0.0' && ipAddress <= '172.24.0.0') &&
    !(ipAddress.startsWith('192.168.'))
  ) {
    return false;
  }

  // Kiểm tra định dạng của địa chỉ IP
  if (!ipAddress.match(/^((\d{1,3}\.\d{1,3}\.0\.0\/16)|(\d{1,3}\.\d{1,3}\.\d{1,3}\.0\/24))$/)) {
    return false;
  }
  return true;
}
@Component({
  selector: 'one-portal-listener-create',
  templateUrl: './listener-create.component.html',
  styleUrls: ['./listener-create.component.less']
})



export class ListenerCreateComponent {
  step: number = 0;
  // validateForm: FormGroup<{
  //   listenerName: FormControl<string>
  //   port: FormControl<number>
  //   member: FormControl<number>
  //   connection: FormControl<number>
  //   timeout: FormControl<number>
  //   allowCIRR: FormControl<string>
  //   description: FormControl<string>
  //   poolName: FormControl<number>
  // }> = this.fb.group({
  //   listenerName: ['', [Validators.required,
  //     Validators.pattern(/^[a-zA-Z0-9_]*$/), Validators.maxLength(50)]],
  //   port: [0, Validators.required],
  //   member: [1],
  //   connection: [1],
  //   timeout: [1],
  //   allowCIRR: ['', [Validators.required, ipAddressValidator()]],
  //   description: [''],
  //   poolName: ['']
  // });
  radioValue: any;
  checkedSession: any;
  sessionFix = 'HTTP';

  constructor(private router: Router,
              private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,) {
  }

  nextStep() {
    this.step += 1;
  }

  priviousStep() {
    if (this.step == 0) {
      this.router.navigate(['/app-smart-cloud/load-balancer/list']);
    } else {
      this.step -= 1;
    }
  }

  checkDisable() {
  }

  createListener() {
  }

}
