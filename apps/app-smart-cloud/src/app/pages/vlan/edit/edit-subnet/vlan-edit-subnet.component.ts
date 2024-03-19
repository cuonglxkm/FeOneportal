import { Component, Inject, OnInit } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../../shared/services/vlan.service';
import { FormUpdateSubnet, Subnet } from '../../../../shared/models/vlan.model';
import { RegionModel } from '../../../../shared/models/region.model';
import { ProjectModel } from '../../../../shared/models/project.model';

@Component({
  selector: 'one-portal-vlan-edit-subnet',
  templateUrl: './vlan-edit-subnet.component.html',
  styleUrls: ['./vlan-edit-subnet.component.less'],
})
export class VlanEditSubnetComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  idNetwork: number

  idSubnet: number

  subnet: Subnet | null = null

  formUpdateSubnet: FormUpdateSubnet = new FormUpdateSubnet()

  isLoading: boolean = false
  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private vlanService: VlanService,
              private route: ActivatedRoute) {
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

  getSubnetById(idSubnet) {
    this.vlanService.getSubnetById(idSubnet).subscribe(data => {
      this.subnet = data
    })
  }

  handleEdit(value) {
    this.isLoading = true
    this.formUpdateSubnet.id = this.idSubnet
    this.formUpdateSubnet.name = value.name
    this.formUpdateSubnet.enableDHCP = value.enableDhcp
    this.formUpdateSubnet.getwayIP = value.gateway
    this.formUpdateSubnet.hostRoutes = null
    console.log('edit', this.formUpdateSubnet);
    this.vlanService.updateSubnet(this.idSubnet, this.formUpdateSubnet).subscribe(data => {
      if(data) {
        this.isLoading = false
        this.router.navigate(['/app-smart-cloud/vlan/network/detail/' + this.idNetwork])
        this.notification.success('Thành công', 'Chỉnh sửa Subnet thành công')
      }
    }, error => {
      this.isLoading = false
      this.router.navigate(['/app-smart-cloud/vlan/network/detail/' + this.idNetwork])
      this.notification.error('Thất bại', 'Chỉnh sửa Subnet thất bại')
    })
  }
  ngOnInit() {
    this.idNetwork = Number.parseInt(this.route.snapshot.paramMap.get('id'))
    this.idSubnet = Number.parseInt(this.route.snapshot.paramMap.get('subnetId'))
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId



    this.getSubnetById(this.idSubnet)
  }

  protected readonly console = console;
}
