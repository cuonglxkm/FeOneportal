import {Component, Inject, OnInit} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {ActivatedRoute, Router} from "@angular/router";
import {PackageBackupService} from "../../../shared/services/package-backup.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {VlanService} from "../../../shared/services/vlan.service";
import {FormSearchSubnet, Port, Subnet} from "../../../shared/models/vlan.model";

@Component({
  selector: 'one-portal-vlan-detail',
  templateUrl: './vlan-detail.component.html',
  styleUrls: ['./vlan-detail.component.less'],
})
export class VlanDetailComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  idNetwork: number

  isLoading: boolean = false

  listPort: Port[] = []
  listSubnet: Subnet[] = []

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private vlanService: VlanService,
              private route: ActivatedRoute) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId

  }

  projectChanged(project: ProjectModel) {
    this.project = project.id
  }

  getPortByNetwork(idNetwork) {
    this.vlanService.getPortByNetwork(idNetwork, this.region).subscribe(data => {
      console.log('data', data)
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
      this.listSubnet = data
    })
  }

  ngOnInit() {
    this.idNetwork = Number.parseInt(this.route.snapshot.paramMap.get('id'))
  }

}
