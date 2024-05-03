import { Component, Inject, OnInit } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../../shared/services/vlan.service';
import { FormSearchSubnet, FormUpdateSubnet, Subnet } from '../../../../shared/models/vlan.model';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { RegionModel, ProjectModel } from '../../../../../../../../libs/common-utils/src';

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

    if (control.value.isEmpty) {
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
  selector: 'one-portal-vlan-extend-subnet',
  templateUrl: './vlan-edit-subnet.component.html',
  styleUrls: ['./vlan-edit-subnet.component.less']
})
export class VlanEditSubnetComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  idNetwork: number;

  idSubnet: number;

  subnet: Subnet | null = null;

  formUpdateSubnet: FormUpdateSubnet = new FormUpdateSubnet();

  isLoading: boolean = false;

  validateForm: FormGroup<{
    nameSubnet: FormControl<string>
    disableGatewayIp: FormControl<boolean>
    enableDhcp: FormControl<boolean>
    gateway: FormControl<string>
  }> = this.fb.group({
    nameSubnet: ['', [Validators.required,
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      this.duplicateNameValidator.bind(this)]],
    disableGatewayIp: [false],
    enableDhcp: [true],
    gateway: ['']
  });

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private vlanService: VlanService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder) {
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
    formSearchSubnet.name = null;
    this.vlanService.getSubnetByNetwork(formSearchSubnet).subscribe(data => {
      data?.records?.forEach(item => {
        this.nameList?.push(item.name);

        this.nameList = this.nameList?.filter(item => !(item.includes(this.validateForm.get('nameSubnet').getRawValue())));
      });
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

  allocationPool: any;

  getSubnetById(idSubnet) {
    this.vlanService.getSubnetById(idSubnet).subscribe(data => {
      this.subnet = data;

      this.validateForm.controls.nameSubnet.setValue(this.subnet?.name);
      this.validateForm.controls.gateway.setValue(this.subnet?.gatewayIp);
      this.validateForm.controls.enableDhcp.setValue(this.subnet?.enableDhcp);
      if (this.subnet.gatewayIp != undefined || this.subnet?.gatewayIp != null) {
        this.validateForm.controls.disableGatewayIp.setValue(false);
      } else {
        this.validateForm.controls.disableGatewayIp.setValue(true);
      }
      this.allocationPool = this.subnet?.allocationPools.map(item => `${item.start}, ${item.end}`).join('\n');
    });
  }

  handleEdit() {
    this.isLoading = true;
    this.formUpdateSubnet.id = this.idSubnet;
    this.formUpdateSubnet.name = this.validateForm.controls.nameSubnet.value;
    this.formUpdateSubnet.enableDHCP = this.validateForm.controls.enableDhcp.value;
    this.formUpdateSubnet.getwayIP = this.validateForm.controls.gateway.value;
    this.formUpdateSubnet.hostRoutes = null;
    console.log('edit', this.formUpdateSubnet);
    this.vlanService.updateSubnet(this.idSubnet, this.formUpdateSubnet).subscribe(data => {
        this.isLoading = false;
        this.router.navigate(['/app-smart-cloud/vlan/network/detail/' + this.idNetwork]);
        this.notification.success('Thành công', 'Chỉnh sửa Subnet thành công');

    }, error => {
      this.isLoading = false;
      this.router.navigate(['/app-smart-cloud/vlan/network/detail/' + this.idNetwork]);
      this.notification.error('Thất bại', 'Chỉnh sửa Subnet thất bại. ' + error.error.detail);
    });
  }

  ngOnInit() {
    this.idNetwork = Number.parseInt(this.route.snapshot.paramMap.get('id'));
    this.idSubnet = Number.parseInt(this.route.snapshot.paramMap.get('subnetId'));
    console.log('id subnet', this.idSubnet);
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.getSubnetById(this.idSubnet);
    this.getListSubnet();
  }

}
