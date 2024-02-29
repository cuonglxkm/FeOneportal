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

  isVisibleDelete: boolean = false
  isLoadingDelete: boolean = false

  isVisibleAttach: boolean = false
  isLoadingAttach: boolean = false

  isVisibleDetach: boolean = false
  isLoadingDetach: boolean = false

  isVisbileDeletePort: boolean = false
  isLoadingDeletePort: boolean = false

  value: string
  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private vlanService: VlanService,
              private route: ActivatedRoute,
              private instancesService: InstancesService) {
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

  instanceChange(value) {
    this.instanceSelected = value
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

  idSubnet: number

  showModalDeleteConfirm(idSubnet) {
    this.isVisibleDelete = true
    this.idSubnet = idSubnet
  }

  handleCancelDelete() {
    this.isVisibleDelete = false
  }

  idPort: number
  showModalAttach(idPort) {
    this.idPort = idPort
    this.isVisibleAttach = true
    this.getListVm()
  }

  handleCancelAttach() {
    this.isVisibleAttach = false
    this.isLoadingAttach = false
  }

  handleOkAttach() {
    console.log('instance', this.instanceSelected)
    console.log('region', this.region)
    this.isLoadingAttach = true
    this.vlanService.attachPort(this.idPort.toString(), this.instanceSelected, this.region, this.project).subscribe(data => {
      console.log('attach', data)
      this.isVisibleAttach = false
      this.isLoadingAttach = false
      this.notification.success('Thành công', 'Gắn port vào máy ảo thành công')
      this.getVlanByNetworkId(this.idNetwork)
    }, error => {
      this.isVisibleAttach = false
      this.isLoadingAttach = false
      this.notification.error('Thất bại', 'Gắn port vào máy ảo thất bại')
    })
  }

  showModalDetach(idPort) {
    this.idPort = idPort
    this.isVisibleDetach = true
    this.getVlanByNetworkId(this.idNetwork)
  }

  handleCancelDetach() {
    this.isVisibleDetach = false
    this.isLoadingDetach = false
  }

  handleOkDetach() {
    this.vlanService.detachPort(this.idPort.toString(), this.region, this.project).subscribe(data => {
      console.log('detach', data)
      this.isVisibleDetach = false
      this.isLoadingDetach = false
      this.notification.success('Thành công', 'Gỡ port vào máy ảo thành công')
      this.getVlanByNetworkId(this.idNetwork)
    }, error => {
      this.isVisibleDetach = false
      this.isLoadingDetach = false
      this.notification.error('Thất bại', 'Gỡ port vào máy ảo thất bại')
    })
  }

  showModalDeletePort(idPort){
    this.idPort = idPort
    this.isVisbileDeletePort = true
  }

  handleCancelDeletePort() {
    this.isVisbileDeletePort = false
    this.isLoadingDeletePort = false
  }

  handleOkDeletePort() {
    this.vlanService.deletePort(this.idPort.toString(), this.region, this.project).subscribe(data => {
      console.log('delete', data)
      this.isVisbileDeletePort = false
      this.isLoadingDeletePort = false
      this.notification.success('Thành công', 'Xoá Port thành công')
      this.getVlanByNetworkId(this.idNetwork)
    }, error => {
      this.isVisbileDeletePort = false
      this.isLoadingDeletePort = false
      this.notification.error('Thất bại', 'Xoá Port thất bại')
    })
  }

  listVm: InstancesModel[]
  instanceSelected: string = ''
  getListVm() {
    this.isLoading = true
    this.instancesService.search(1, 9999, this.region, this.project, '', '',
      true, this.tokenService.get()?.userId).subscribe(data => {
      this.isLoading = false
      this.listVm = data.records
      console.log('listvm', this.listVm)
    })
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
    this.getSubnetByNetwork(this.idNetwork)
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
