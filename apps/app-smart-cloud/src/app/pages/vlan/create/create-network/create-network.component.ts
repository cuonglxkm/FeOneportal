import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../../shared/services/vlan.service';
import { getCurrentRegionAndProject } from '@shared';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { FormCreateNetwork, FormSearchNetwork } from '../../../../shared/models/vlan.model';
import { AppValidator, ProjectModel, RegionModel } from '../../../../../../../../libs/common-utils/src';
import { debounceTime, Subject } from 'rxjs';

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
  selector: 'one-portal-create-network',
  templateUrl: './create-network.component.html',
  styleUrls: ['./create-network.component.less']
})


export class CreateNetworkComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false;

  isDisableGatewayIp: boolean = false;
  isDhcp: boolean = false;

  isActiveHostRoute: boolean = false;
  listHostRoutes = [];

  formCreateNetwork: FormCreateNetwork = new FormCreateNetwork();

  validateForm: FormGroup<{
    nameNetwork: FormControl<string>
    nameSubnet: FormControl<string>
    networkAddress: FormControl<string>
    disableGatewayIp: FormControl<boolean>
    dhcp: FormControl<boolean>
    gateway: FormControl<string>
    allocationPool: FormControl<string>
  }> = this.fb.group({
    nameNetwork: ['vlan_', [Validators.required,
      AppValidator.startsWithValidator('vlan_'),
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      this.duplicateNameValidator.bind(this)]],
    nameSubnet: ['', [Validators.required,
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z0-9_]*$/)]],
    networkAddress: ['', [Validators.required,
      ipAddressValidator()]],
    disableGatewayIp: [false],
    dhcp: [true],
    gateway: [''],
    allocationPool: [null as string, []]
  });

  pool: string = '';
  dataSubjectCidr: Subject<any> = new Subject<any>();

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private vlanService: VlanService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder) {
    this.validateForm.get('disableGatewayIp').valueChanges.subscribe(() => {

      this.validateForm.get('gateway').reset();
    });
  }

  regionChanged(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/vlan/network/list']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/vlan/network/list']);
  }

  disableGatewayIp(value) {
    this.isDisableGatewayIp = value;
  }

  dhcp(value) {
    this.isDhcp = value;
  }

  submitForm() {
    if (this.validateForm.valid) {
      this.isLoading = true;
      console.log('value form', this.validateForm.getRawValue());
      this.formCreateNetwork.networktAddress = this.validateForm.controls.networkAddress.value;
      this.formCreateNetwork.name = this.validateForm.controls.nameNetwork.value;
      this.formCreateNetwork.vpcId = this.project;
      this.formCreateNetwork.regionId = this.region;
      this.formCreateNetwork.customerId = this.tokenService.get()?.userId;
      this.formCreateNetwork.subnetName = this.validateForm.controls.nameSubnet.value;
      this.formCreateNetwork.gatewayIP = this.validateForm.controls.gateway.value;
      this.formCreateNetwork.dnsNameServer = null;
      // if(this.isInPurchasedSubnet())
      this.formCreateNetwork.allocationPool = this.validateForm.controls.allocationPool.value;
      this.formCreateNetwork.enableDHCP = this.validateForm.controls.dhcp.value;
      this.formCreateNetwork.hostRoutes = null;

      this.vlanService.createNetwork(this.formCreateNetwork).subscribe(data => {
        this.isLoading = false;
        this.router.navigate(['/app-smart-cloud/vlan/network/list']);
        this.notification.success('Thành công', 'Thêm mới Network thành công');

      }, error => {
        this.isLoading = false;
        this.notification.error('Thất bại', 'Thêm mới Network thất bại. ', error.error.detail);
      });
    } else {
      console.log('value form invalid', this.validateForm.getRawValue());
    }
  }

  nameList: string[] = [];

  getListNetwork() {
    let formSearch = new FormSearchNetwork();
    formSearch.project = this.project;
    formSearch.region = this.region;
    formSearch.pageNumber = 1;
    formSearch.pageSize = 9999;
    this.vlanService.getVlanNetworks(formSearch).subscribe(data => {
      data?.records?.forEach(item => {
        this.nameList?.push(item.name);
      });
    });
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

  reset() {
    this.validateForm.reset()
  }

  inputCheckPool(value) {
    this.dataSubjectCidr.next(value);
  }

  onInputCheckPool() {
    this.dataSubjectCidr.pipe(debounceTime(500)).subscribe((res) => {
      this.vlanService.checkAllocationPool(res).subscribe(data => {
        this.pool = JSON.stringify(data)
        console.log('pool', this.pool)
      })
    })

  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.getListNetwork();
    this.onInputCheckPool();
  }
}
