import { Component, Inject } from '@angular/core';
import { ProjectModel, RegionModel } from '../../../../../../libs/common-utils/src';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RouterService } from 'src/app/shared/services/router.service';

@Component({
  selector: 'one-portal-network-topology',
  templateUrl: './network-topology.component.html',
  styleUrls: ['./network-topology.component.less'],
})
export class NetworkTopologyComponent {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  customerId: number
  projectType: any;

  isLoading: boolean = false

  isBegin: boolean = false

  constructor(private routerService: RouterService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
  }
  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChange(project: ProjectModel) {
    this.project = project.id;
    this.projectType = project.type;
    console.log(this.projectType);
    this.getData(true);
  }

  getData(isCheckBegin) {
    this.isLoading = true
    
    this.routerService.networkTopology(this.region, this.project)
      .pipe()
      .subscribe(data => {
      this.isLoading = false
        debugger
    }, error => {
        this.isLoading = false;
      })
  }
}
