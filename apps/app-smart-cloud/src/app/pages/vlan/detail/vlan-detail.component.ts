import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { VlanService } from '../../../shared/services/vlan.service';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-vlan-detail',
  templateUrl: './vlan-detail.component.html',
  styleUrls: ['./vlan-detail.component.less']
})
export class VlanDetailComponent implements OnInit, OnChanges {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  idNetwork: number;

  networkName: string;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private vlanService: VlanService,
              private notification: NzNotificationService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('reload')
       if(changes.checkDelete) {
         setTimeout(() => {this.getVlanByNetworkId()}, 2000)
       }
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
    },error => {
      if(error.status == '404') {
        this.notification.error('', 'Network không tồn tại!')
        this.router.navigate(['/app-smart-cloud/vlan/network/list'])
      }
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
