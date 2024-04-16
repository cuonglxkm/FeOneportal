import { Component, OnInit } from '@angular/core';
import { RegionModel } from '../../../shared/models/region.model';
import { ProjectModel } from '../../../shared/models/project.model';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { VlanService } from '../../../shared/services/vlan.service';

@Component({
  selector: 'one-portal-vlan-detail',
  templateUrl: './vlan-detail.component.html',
  styleUrls: ['./vlan-detail.component.less'],
})
export class VlanDetailComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  idNetwork: number

  networkName: string

  constructor(private router: Router,
              private route: ActivatedRoute,
              private vlanService: VlanService) {
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

  getVlanByNetworkId() {
    this.vlanService.getVlanByNetworkId(this.idNetwork).subscribe(data => {
      this.networkName = data.name
    })
  }
  ngOnInit() {
    this.idNetwork = Number.parseInt(this.route.snapshot.paramMap.get('id'))
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId

    console.log('project', this.project)
    this.getVlanByNetworkId()
  }

}
