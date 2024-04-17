import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
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
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../shared/services/vlan.service';
import { FormSearchSubnet, Subnet } from '../../../shared/models/vlan.model';

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

// Hàm kiểm tra xem địa chỉ IP có hợp lệ không
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

export function ipAddressListValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {

    // Chuyển đổi các IP thành một mảng
    const ipAddresses = control?.value?.split(',').map(ip => ip.trim());

    if(control.value.isEmpty) {
      return null;
    }

    // Kiểm tra mỗi địa chỉ IP trong mảng
    for (let i = 0; i < ipAddresses?.length; i++) {
      const currentIP = ipAddresses[i];

      // Kiểm tra định dạng của IP (x.x.x.x)
      const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipPattern.test(currentIP)) {
        return { 'invalidIpAddressFormat': { value: currentIP } };
      }

      // Kiểm tra xem IP có nằm trong các dải cho phép không
      if (!isValidIPAddressAllocation(currentIP)) {
        return { 'invalidIpAddressRange': { value: currentIP } };
      }

      // Kiểm tra xem IP có lớn hơn IP trước đó không
      if (i > 0 && !isGreaterIPAddress(ipAddresses[i - 1], currentIP)) {
        return { 'invalidIpSequence': { value: currentIP } };
      }
    }

    return null;
  };
}

function isValidIPAddressAllocation(ip: string): boolean {
  // Kiểm tra xem IP có nằm trong các dải cho phép không
  const ipSegments = ip.split('.');
  const firstSegment = parseInt(ipSegments[0], 10);
  const secondSegment = parseInt(ipSegments[1], 10);
  const thirdSegment = parseInt(ipSegments[2], 10);

  if ((firstSegment === 10 && secondSegment >= 21 && secondSegment <= 255) ||
    (firstSegment === 172 && secondSegment >= 16 && secondSegment <= 24) ||
    (firstSegment === 192 && secondSegment === 168)) {
    return true;
  }

  return false;
}

function isGreaterIPAddress(previousIP: string, currentIP: string): boolean {
  // So sánh các phần của hai IP để kiểm tra xem IP sau lớn hơn IP trước đó không
  const previousIPSegments = previousIP.split('.').map(segment => parseInt(segment, 10));
  const currentIPSegments = currentIP.split('.').map(segment => parseInt(segment, 10));

  for (let i = 0; i < 4; i++) {
    if (currentIPSegments[i] > previousIPSegments[i]) {
      return true;
    } else if (currentIPSegments[i] < previousIPSegments[i]) {
      return false;
    }
  }

  return false;
}
@Component({
  selector: 'one-portal-subnet-form',
  templateUrl: './subnet-form.component.html',
  styleUrls: ['./subnet-form.component.less']
})
export class SubnetFormComponent implements OnInit {
  @Input() value: Subnet | null | undefined;
  @Input() region: number;
  @Input() idNetwork: number;
  @Output() onSubmit = new EventEmitter<Record<string, unknown>>;

  validateForm: FormGroup<{
    name: FormControl<string>
    subnetAddressRequired: FormControl<string>
    disableGatewayIp: FormControl<boolean>
    enableDhcp: FormControl<boolean>
    gateway: FormControl<string>
    allocationPool: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required,
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      this.duplicateNameValidator.bind(this)]],
    subnetAddressRequired: ['', [Validators.required, ipAddressValidator()]],
    disableGatewayIp: [false],
    enableDhcp: [false],
    gateway: [''],
    allocationPool: ['', []]
  });

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private vlanService: VlanService,
              private fb: NonNullableFormBuilder) {
  }

  onChangeInput(value) {
    if(value == undefined || value == null || value == '') {
      this.validateForm.controls.allocationPool.clearValidators()
      this.validateForm.controls.allocationPool.updateValueAndValidity()
    } else {
      this.validateForm.controls.allocationPool.setValidators(ipAddressListValidator())
    }
  }

  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null; // Name is unique
    }
  }

  nameList: string[] = [];

  getListSubnet() {
    let formSearchSubnet = new FormSearchSubnet();
    formSearchSubnet.region = this.region;
    formSearchSubnet.pageSize = 9999;
    formSearchSubnet.pageNumber = 1;
    formSearchSubnet.customerId = this.tokenService.get()?.userId;
    formSearchSubnet.networkId = this.idNetwork;
    formSearchSubnet.name = '';
    this.vlanService.getSubnetByNetwork(formSearchSubnet).subscribe(data => {
      data?.records?.forEach(item => {
        this.nameList?.push(item.name);
      });
    });
  }

  ipAddressValidator(): ValidatorFn {
    return (control) => {
      const ipAddresses = control.value.split(',');
      let isValid = true;

      for (let i = 0; i < ipAddresses.length; i++) {
        const ipAddress = ipAddresses[i].trim();
        if (!this.isValidIpAddress(ipAddress)) {
          isValid = false;
          break;
        }
      }

      if (!isValid) {
        return { 'invalidIpAddress': true };
      }

      return null;
    };
  }

  isValidIpAddress(ipAddress: string) {
    // Kiểm tra định dạng của địa chỉ IP
    const ipRegex = /^(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipSubnetRegex = /^(10\.(2[1-9]|[3-9][0-9]|1[0-9]{2}|25[0-5])\.([0-9]{1,3})\.0\/16)|(172\.(1[6-9]|2[0-4])\.([0-9]{1,3})\.0\/16)|(192\.168\.0\.0\/16)|(10\.(2[1-9]|[3-9][0-9]|1[0-9]{2}|25[0-5])\.[0-9]{1,3}\.0\/24)|(172\.(1[6-9]|2[0-4])\.[0-9]{1,3}\.0\/24)|(192\.168\.[0-9]{1,3}\.0\/24)$/;

    return ipRegex.test(ipAddress) && ipSubnetRegex.test(ipAddress);
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      this.onSubmit.emit(Object.assign(this.validateForm.value));
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  formatIPAddresses() {
    // Chia các địa chỉ IP thành mảng bằng dấu phẩy
    const ipArray = this.validateForm.controls.allocationPool.value.split(',');

    // Loại bỏ khoảng trắng thừa ở đầu và cuối mỗi địa chỉ IP
    const trimmedIPArray = ipArray.map(ip => ip.trim());

    // Ghép các địa chỉ IP lại với nhau, mỗi địa chỉ trên một dòng
    this.validateForm.controls.allocationPool.setValue(trimmedIPArray.join('\n'));
  }

  ngOnInit() {
    this.getListSubnet();
  }

}
