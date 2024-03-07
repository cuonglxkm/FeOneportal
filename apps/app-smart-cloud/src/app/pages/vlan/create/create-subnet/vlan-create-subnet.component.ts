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
  ValidationErrors,
  Validators
} from '@angular/forms';
import { AppValidator } from '../../../../../../../../libs/common-utils/src';
import { FormCreateSubnet } from '../../../../shared/models/vlan.model';
import { getCurrentRegionAndProject } from '@shared';

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
      Validators.pattern(/^[a-zA-Z0-9_]*$/)]],
    nameSubnet: ['', [Validators.required,
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z0-9_]*$/)]],
    networkAddress: ['', [Validators.required, this.validate.bind(this)]],
    disableGatewayIp: [false],
    dhcp: [false],
    gateway: [''],
    comment: [''],
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

  validate(control: AbstractControl): ValidationErrors | null {
    const ipAddress = control.value;
    if (!ipAddress) {
      return null; // Để trống được phép
    }

    // Kiểm tra định dạng IP và phạm vi
    const ipRegex = /^(10\.(2[1-9]|[3-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.0\.0|172\.(1[6-9]|2[0-4])\.0\.0|192\.168\.0\.0)(\/(16|24))?$/;
    if (!ipRegex.test(ipAddress)) {
      return { 'invalidIp': true };
    }

    return null; // IP hợp lệ
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
    this.formCreateSubnet.networktAddress = value.networkAddress
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
  }
}
