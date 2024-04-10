import { Component, Inject, OnInit } from '@angular/core';
import { RegionModel } from '../../../../shared/models/region.model';
import { ProjectModel } from '../../../../shared/models/project.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../../shared/services/vlan.service';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors, ValidatorFn,
  Validators
} from '@angular/forms';
import { AppValidator } from '../../../../../../../../libs/common-utils/src';
import { FormCreateSubnet, FormSearchSubnet } from '../../../../shared/models/vlan.model';
import { getCurrentRegionAndProject } from '@shared';


export function ipRangeValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value: string = control.value;

    // Kiểm tra xem giá trị có rỗng không
    if (!value) {
      return null;
    }

    // Kiểm tra định dạng x.x.0.0/16 hoặc x.x.x.0/24
    const pattern = /^(10\.(2[1-9]|[3-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.0\.0|172\.(1[6-9]|2[0-3])\.0\.0|192\.168\.0\.0)(\/16|(\.\d{1,3})?\/24)$/;
    if (!pattern.test(value)) {
      return { invalidIpRange: true };
    }

    // Kiểm tra các dải địa chỉ cụ thể
    const parts = value.split('.');
    const octet1 = parseInt(parts[0], 10);
    const octet2 = parseInt(parts[1], 10);
    const octet3 = parseInt(parts[2], 10);
    const octet4 = parseInt(parts[3], 10);

    if (!((octet1 === 10 && octet2 >= 21 && octet2 <= 255) ||
      (octet1 === 172 && octet2 === 16 && octet3 === 0 && octet4 === 0) ||
      (octet1 === 172 && octet2 === 17 && octet3 === 0 && octet4 === 0) ||
      (octet1 === 172 && octet2 === 18 && octet3 === 0 && octet4 === 0) ||
      (octet1 === 172 && octet2 === 19 && octet3 === 0 && octet4 === 0) ||
      (octet1 === 172 && octet2 === 20 && octet3 === 0 && octet4 === 0) ||
      (octet1 === 172 && octet2 === 21 && octet3 === 0 && octet4 === 0) ||
      (octet1 === 172 && octet2 === 22 && octet3 === 0 && octet4 === 0) ||
      (octet1 === 172 && octet2 === 23 && octet3 === 0 && octet4 === 0) ||
      (octet1 === 172 && octet2 === 24 && octet3 === 0 && octet4 === 0) ||
      (octet1 === 192 && octet2 === 168 && octet3 === 0 && octet4 === 0))) {
      return { invalidIpRange: true };
    }

    return null;
  };
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
  selector: 'one-portal-vlan-create-subnet',
  templateUrl: './vlan-create-subnet.component.html',
  styleUrls: ['./vlan-create-subnet.component.less'],
})
export class VlanCreateSubnetComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));
  isLoading: boolean = false

  validateForm: FormGroup<{
    nameNetwork: FormControl<string>
    nameSubnet: FormControl<string>
    networkAddress: FormControl<string>
    disableGatewayIp: FormControl<boolean>
    dhcp: FormControl<boolean>
    gateway: FormControl<string>
    comment: FormControl<string>
    hostRoute: FormControl<string[]>
  }> = this.fb.group({
    nameNetwork: ['', [Validators.required,
      AppValidator.startsWithValidator('vlan_'),
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      this.duplicateNameValidator.bind(this)]],
    nameSubnet: ['', [Validators.required,
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z0-9_]*$/)]],
    networkAddress: ['', [Validators.required, ipRangeValidator()]],
    disableGatewayIp: [false],
    dhcp: [false],
    gateway: [''],
    comment: ['', [ipAddressListValidator()]],
    hostRoute: [null as string[]]
  })

  formCreateSubnet: FormCreateSubnet = new FormCreateSubnet()

  idNetwork: number
  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private vlanService: VlanService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder,) {
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

  nameList: string[] = []
  getListSubnet() {
    let formSearchSubnet = new FormSearchSubnet()
    formSearchSubnet.region = this.region
    formSearchSubnet.pageSize = 9999
    formSearchSubnet.pageNumber = 1
    formSearchSubnet.customerId = this.tokenService.get()?.userId
    formSearchSubnet.networkId = this.idNetwork
    formSearchSubnet.name = ''
    this.vlanService.getSubnetByNetwork(formSearchSubnet).subscribe(data => {
      data?.records?.forEach(item => {
        this.nameList?.push(item.name)
      })
    })
  }

  regionChanged(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/vlan/list'])
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/vlan/list'])
  }

  handleCreate(value) {
    this.isLoading = true
    this.formCreateSubnet.name = value.name
    this.formCreateSubnet.vlanId = this.idNetwork
    this.formCreateSubnet.region = this.region
    this.formCreateSubnet.networktAddress = value.subnetAddressRequired
    this.formCreateSubnet.gatewayIP = value.gateway
    this.formCreateSubnet.allocationPool = value.allocationPool
    this.formCreateSubnet.dnsNameServer = null
    this.formCreateSubnet.enableDHCP = value.enableDhcp
    this.formCreateSubnet.hostRoutes = null
    this.formCreateSubnet.customerId = this.tokenService.get()?.userId

    console.log('create', value)
    this.vlanService.createSubnet(this.formCreateSubnet).subscribe(data => {
      if(data) {
        this.isLoading = false
        this.router.navigate(['/app-smart-cloud/vlan/network/detail/' + this.idNetwork])
        this.notification.success('Thành công', 'Tạo mới subnet thành công')
      }
    }, error => {
      this.isLoading = false
      this.router.navigate(['/app-smart-cloud/vlan/network/detail/' + this.idNetwork])
      this.notification.error('Thất bại', 'Tạo mới subnet thất bại')
    })
  }

  ngOnInit() {
    this.idNetwork = Number.parseInt(this.route.snapshot.paramMap.get('id'))
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId

    console.log('project', this.project)
    this.getListSubnet()
  }
}
