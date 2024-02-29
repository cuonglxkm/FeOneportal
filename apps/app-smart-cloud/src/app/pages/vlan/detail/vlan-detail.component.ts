import {Component, Inject, OnInit} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {ActivatedRoute, Router} from "@angular/router";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {VlanService} from "../../../shared/services/vlan.service";
import { FormSearchPort, FormSearchSubnet, Port, Subnet } from '../../../shared/models/vlan.model';
import {getCurrentRegionAndProject} from "@shared";
import {ProjectService} from "../../../shared/services/project.service";
import { BaseResponse } from '../../../../../../../libs/common-utils/src';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'one-portal-vlan-detail',
  templateUrl: './vlan-detail.component.html',
  styleUrls: ['./vlan-detail.component.less'],
})
export class VlanDetailComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  idNetwork: number
  networkCloudId: string

  isLoading: boolean = false

  isLoadingSubnet: boolean = false
  isLoadingPort: boolean = false

  responsePort: BaseResponse<Port[]>
  responseSubnet: BaseResponse<Subnet[]>

  networkName: string

  valueSubnet: string
  valuePort: string

  pageSize: number = 10
  pageNumber: number = 1

  isVisibleDelete: boolean = false
  isLoadingDelete: boolean = false

  value: string
  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private vlanService: VlanService,
              private route: ActivatedRoute) {
  }

  regionChanged(region: RegionModel) {
    // this.region = region.regionId

    this.router.navigate(['/app-smart-cloud/vlan/network/list'])
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/vlan/network/list'])
  }

  getPortByNetwork(networkCloudId) {
    this.isLoadingPort = true
    this.vlanService.getPortByNetwork(networkCloudId, this.region, this.pageSize, this.pageNumber, this.valuePort)
      .pipe(debounceTime(500))
      .subscribe(data => {
        console.log('port', data)
        this.responsePort = data
        this.isLoadingPort = false
      })
  }

  getSubnetByNetwork(idNetwork) {
    this.isLoadingSubnet = true
    let formSearchSubnet = new FormSearchSubnet()
    formSearchSubnet.networkId = idNetwork
    formSearchSubnet.customerId = this.tokenService.get()?.userId
    formSearchSubnet.region = this.region
    formSearchSubnet.pageSize = this.pageSize
    formSearchSubnet.pageNumber = this.pageNumber
    formSearchSubnet.name = this.valueSubnet

    this.vlanService.getSubnetByNetwork(formSearchSubnet).subscribe(data => {
      console.log('data-subnet', data)
      this.responseSubnet = data
      this.isLoadingSubnet = false
    })
  }

  onPageSizeChangeSubnet(value) {
    this.pageSize = value
    this.getSubnetByNetwork(this.idNetwork)
  }

  onPageIndexChangeSubnet(value) {
    this.pageNumber = value
    this.getSubnetByNetwork(this.idNetwork)
  }

  onInputChangeSubnet(value) {
    this.valueSubnet = value
    this.getSubnetByNetwork(this.idNetwork)
  }

  onPageSizeChangePort(value) {
    this.pageSize = value
    this.getPortByNetwork(this.networkCloudId)
  }

  onPageIndexChangePort(value) {
    this.pageNumber = value
    this.getPortByNetwork(this.networkCloudId)
  }
  onInputChangePort(value) {
    this.valuePort = value
  }

  navigateToCreateSubnet() {
    this.router.navigate(['/app-smart-cloud/vlan/' + this.idNetwork + '/create/subnet'])
  }

  navigateToCreatePort() {

  }

  navigateToEditSubnet(idSubnet) {
    this.router.navigate(['/app-smart-cloud/vlan/'+ this.idNetwork +'/network/edit/subnet/' + idSubnet])
  }

  idSubnet: number

  showModalDeleteConfirm(idSubnet) {
    this.isVisibleDelete = true
    this.idSubnet = idSubnet
  }

  handleCancelDelete() {
    this.isVisibleDelete = false
  }

  nameSubnet: string
  handleOkDelete() {
    this.vlanService.getSubnetById(this.idSubnet).subscribe(data => {
      this.nameSubnet = data.name
      if(this.value.includes(this.nameSubnet)) {
        this.isLoadingDelete = true
        this.vlanService.deleteSubnet(this.idSubnet).subscribe(item => {
          this.isVisibleDelete = false
          this.isLoadingDelete = false
          this.getSubnetByNetwork(this.idNetwork)
          this.notification.success('Thành công', 'Xoá subnet thành công')
        }, error => {
          this.isVisibleDelete = false
          this.isLoadingDelete = false
          this.getSubnetByNetwork(this.idNetwork)
          this.notification.error('Thất bại', 'Xoá subnet thất bại')
        })
      }
    })

  }

  onInputChange(value) {
    this.value = value
  }

  handleOk() {
    this.getVlanByNetworkId(this.idNetwork)
  }

  getVlanByNetworkId(idNetwork) {
    this.vlanService.getVlanByNetworkId(this.idNetwork).subscribe(data => {
      this.networkName = data.name
      this.networkCloudId = data.cloudId
      this.getPortByNetwork(data.cloudId)
    })
  }
  ngOnInit() {
    this.idNetwork = Number.parseInt(this.route.snapshot.paramMap.get('id'))
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId

    console.log('project', this.project)

    this.getSubnetByNetwork(this.idNetwork)
    this.getVlanByNetworkId(this.idNetwork)

  }

}
