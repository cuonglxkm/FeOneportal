import { Component } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { RegionModel } from 'src/app/shared/models/region.model';
import { BaseResponse } from '../../../../../../../libs/common-utils/src';
import { VpnSiteToSiteDTO } from 'src/app/shared/models/vpn-site-to-site';
import { VpnSiteToSiteService } from 'src/app/shared/services/vpn-site-to-site.service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'one-portal-vpn-site-to-site-manage',
  templateUrl: './vpn-site-to-site-manage.component.html',
  styleUrls: ['./vpn-site-to-site-manage.component.less']
})

export class VpnSiteToSiteManage {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));


  isBegin: boolean = false;
  isLoading: boolean = false
  response: BaseResponse<VpnSiteToSiteDTO>
  constructor(private vpnSiteToSiteService: VpnSiteToSiteService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id;
    console.log(this.project);
    this.getData(true)
  }
  

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.getData(true)
  }

  getData(isBegin) {
    this.isLoading = true
    this.vpnSiteToSiteService.getVpnSiteToSite(this.project)
      .subscribe(data => {
        if(data){
          this.isLoading = false
          this.response = data
          console.log(this.response);
          
        }
      if (isBegin) {
        this.isBegin = this.response === null ? true : false;
      }
    }, error => {
      this.isLoading = false;
      this.response = null;
      console.log(this.response);
      if (isBegin) {
        this.isBegin = this.response === null ? true : false;
      }
    })
  }

}
