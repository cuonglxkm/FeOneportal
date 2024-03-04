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
import { VolumeService } from '../../../shared/services/volume.service';
import { GetAllVmModel } from '../../../shared/models/volume.model';
import { InstancesModel } from '../../instances/instances.model';
import { InstancesService } from '../../instances/instances.service';

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

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private vlanService: VlanService,
              private route: ActivatedRoute,
              private instancesService: InstancesService) {
  }

  regionChanged(region: RegionModel) {
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

  navigateToEditSubnet(idSubnet) {
    this.router.navigate(['/app-smart-cloud/vlan/'+ this.idNetwork +'/network/edit/subnet/' + idSubnet])
  }

  handleOkAttach() {
    this.getSubnetByNetwork(this.idNetwork)
    this.getPortByNetwork(this.idNetwork)
  }

  handleOkDetach() {
    this.getSubnetByNetwork(this.idNetwork)
    this.getPortByNetwork(this.idNetwork)
  }

  handleOkDeletePort() {
    this.getSubnetByNetwork(this.idNetwork)
    this.getPortByNetwork(this.idNetwork)
  }

  handleOkDeleteSubnet() {
    this.getSubnetByNetwork(this.idNetwork)
    this.getPortByNetwork(this.idNetwork)
  }

  handleOkCreatePort() {
    this.getSubnetByNetwork(this.idNetwork)
    this.getPortByNetwork(this.idNetwork)
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
