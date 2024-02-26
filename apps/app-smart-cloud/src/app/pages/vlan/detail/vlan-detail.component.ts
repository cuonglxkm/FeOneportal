import {Component, Inject, OnInit} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {ActivatedRoute, Router} from "@angular/router";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {VlanService} from "../../../shared/services/vlan.service";
import {FormSearchSubnet, Port, Subnet} from "../../../shared/models/vlan.model";
import {getCurrentRegionAndProject} from "@shared";
import {ProjectService} from "../../../shared/services/project.service";

@Component({
  selector: 'one-portal-vlan-detail',
  templateUrl: './vlan-detail.component.html',
  styleUrls: ['./vlan-detail.component.less'],
})
export class VlanDetailComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  idNetwork: number

  isLoading: boolean = false

  listPort: Port[] = []
  listSubnet: Subnet[] = []
  listSubnetByNetwork: Subnet[] = []

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private vlanService: VlanService,
              private projectService: ProjectService,
              private route: ActivatedRoute) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId

    this.projectService.getByRegion(this.region).subscribe(data => {
      if (data.length) {
        localStorage.setItem("projectId", data[0].id.toString())
        this.router.navigate(['/app-smart-cloud/vlan/network/list'])
      }
    });
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id
  }

  getPortByNetwork(idNetwork) {
    this.vlanService.getPortByNetwork(idNetwork, this.region).subscribe(data => {
      console.log('data-port', data)
      this.listPort = data
    })
  }

  getSubnetByNetwork(idNetwork) {
    let formSearchSubnet = new FormSearchSubnet()
    formSearchSubnet.pageSize = 9999
    formSearchSubnet.pageNumber = 1
    formSearchSubnet.region = this.region
    formSearchSubnet.customerId = this.tokenService.get()?.userid
    this.vlanService.getListSubnet(formSearchSubnet).subscribe(data => {
      console.log('data-sub', data.records)
      this.listSubnet = data.records
      this.listSubnet?.forEach(item => {
        if(item.networkId == idNetwork) {
          if(this.listSubnetByNetwork?.length > 1){
            this.listSubnetByNetwork?.push(item)
          } else {
            this.listSubnetByNetwork = [item]
          }
          console.log('lst subnet', this.listSubnetByNetwork)
        }
      })
    })
  }

  ngOnInit() {
    this.idNetwork = Number.parseInt(this.route.snapshot.paramMap.get('id'))
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    console.log('project', this.project)

    this.getSubnetByNetwork(this.idNetwork)
    this.getPortByNetwork(this.idNetwork)
  }

}
