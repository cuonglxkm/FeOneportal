import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../../shared/services/vlan.service';
import { getCurrentRegionAndProject } from '@shared';
import { RegionModel } from '../../../../shared/models/region.model';
import { ProjectModel } from '../../../../shared/models/project.model';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { FormCreateNetwork } from '../../../../shared/models/vlan.model';
import { AppValidator } from '../../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-create-network',
  templateUrl: './create-network.component.html',
  styleUrls: ['./create-network.component.less'],
})
export class CreateNetworkComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false

  isDisableGatewayIp: boolean = false
  isDhcp: boolean = false

  isActiveHostRoute: boolean = false
  listHostRoutes = []

  formCreateNetwork: FormCreateNetwork = new FormCreateNetwork()

  validateForm: FormGroup<{
    nameNetwork: FormControl<string>
    nameSubnet: FormControl<string>
    networkAddress: FormControl<string>
    disableGatewayIp: FormControl<boolean>
    dhcp: FormControl<boolean>
    gateway: FormControl<string>
    allocationPool: FormControl<string>
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
    allocationPool: ['']
  });

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private vlanService: VlanService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder,) {
    this.validateForm.get('disableGatewayIp').valueChanges.subscribe(() => {

      this.validateForm.get('gateway').reset()
    })
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

  disableGatewayIp(value) {
    this.isDisableGatewayIp = value
  }

  dhcp(value) {
    this.isDhcp = value
  }

  submitForm(){
    if(this.validateForm.valid) {
      this.isLoading = true
      console.log('value form', this.validateForm.getRawValue())
      this.formCreateNetwork.networktAddress = this.validateForm.controls.networkAddress.value
      this.formCreateNetwork.name = this.validateForm.controls.nameNetwork.value
      this.formCreateNetwork.vpcId = this.project
      this.formCreateNetwork.regionId = this.region
      this.formCreateNetwork.customerId = this.tokenService.get()?.userId

      this.vlanService.createNetwork(this.formCreateNetwork).subscribe(data => {
        this.isLoading = false
        this.router.navigate(['/app-smart-cloud/vlan/network/list'])
        this.notification.success('Thành công', 'Thêm mới Network thành công')

      }, error => {
        this.isLoading = false
        this.notification.error('Thất bại', 'Thêm mới Network thất bại')
      })
    } else {
      console.log('value form invalid', this.validateForm.getRawValue())
    }
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
  }
}
