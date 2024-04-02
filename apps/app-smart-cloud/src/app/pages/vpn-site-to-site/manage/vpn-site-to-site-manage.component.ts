import { Component } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { RegionModel } from 'src/app/shared/models/region.model';
import { BaseResponse } from '../../../../../../../libs/common-utils/src';
import { VpnSiteToSiteDTO } from 'src/app/shared/models/vpn-site-to-site';
import { VpnSiteToSiteService } from 'src/app/shared/services/vpn-site-to-site.service';
import { debounceTime } from 'rxjs';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';

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
  isVisibleDelete: boolean = false;

  constructor(
    private vpnSiteToSiteService: VpnSiteToSiteService, 
    private router: Router, 
    private notification: NzNotificationService,
  ) {
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

  createVpn() {
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site/create']);
  }

  extendVpn() {
    this.router.navigate([`/app-smart-cloud/vpn-site-to-site/extend/${this.project}`]);
  }

  resizeVpn() {
    this.router.navigate([`/app-smart-cloud/vpn-site-to-site/resize/${this.project}`]);
  }

  modalDelete() {
    this.isVisibleDelete = true;
  }

  handleCancelDelete() {
    this.isVisibleDelete = false;
  }

  handleOkDelete() {
    this.isVisibleDelete = false;
    this.notification.success('', 'Xóa VPN site to site thành công');
    if(this.response['id']){
      this.vpnSiteToSiteService
      .deteleVpnSiteToSite(this.response['id'])
      .subscribe({
        next: (data) => {
          console.log(data);
          this.notification.success('', 'Xóa VPN site to site thành công');
        },
        error: (error) => {
          console.log(error.error);
          this.notification.error('', 'Xóa VPN site to site không thành công');
        },
      });
    }
  }
}
