import {Component, OnInit} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {FormSearchNetwork, NetWorkModel} from "../../../shared/models/vlan.model";
import {BaseResponse} from "../../../../../../../libs/common-utils/src";
import {VlanService} from "../../../shared/services/vlan.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'one-portal-list-vlan',
  templateUrl: './list-vlan.component.html',
  styleUrls: ['./list-vlan.component.less'],
})
export class ListVlanComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  typeVPC: number

  value: string

  formSearchNetwork: FormSearchNetwork = new FormSearchNetwork()

  response: BaseResponse<NetWorkModel[]>

  pageSize: number = 10
  pageNumber: number = 1

  isLoading: boolean = false

  constructor(private vlanService: VlanService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId

  }

  projectChanged(project: ProjectModel) {
    this.project = project.id
    this.typeVPC = project.type

    this.getListVlanNetwork()
  }

  onInputChange(value) {
    this.value = value

  }

  navigateToCreateNetwork() {

  }

  networkInit(){
    this.formSearchNetwork.vlanName = this.value
    this.formSearchNetwork.region = this.region
    this.formSearchNetwork.pageSize = this.pageSize
    this.formSearchNetwork.pageNumber = this.pageNumber
  }

  onPageSizeChange(value) {
    this.pageSize = value
    this.getListVlanNetwork()
  }

  onPageIndexChange(value) {
    this.pageNumber = value
    this.getListVlanNetwork()
  }

  getListVlanNetwork() {
    this.isLoading = true
    this.networkInit()
    this.vlanService.getVlanNetworks(this.formSearchNetwork).subscribe(data => {
      console.log('data', data)
      this.response = data
      this.isLoading = false
    })
  }

  ngOnInit() {
  }
}
