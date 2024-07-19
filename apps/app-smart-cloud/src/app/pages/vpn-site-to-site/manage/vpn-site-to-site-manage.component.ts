import { Component, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { VpnSiteToSiteService } from 'src/app/shared/services/vpn-site-to-site.service';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-vpn-site-to-site-manage',
  templateUrl: './vpn-site-to-site-manage.component.html',
  styleUrls: ['./vpn-site-to-site-manage.component.less']
})

export class VpnSiteToSiteManage {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));  
  projectObject: any;
  isBegin: boolean = false;
  isLoading: boolean = false
  response: any
  isVisibleDelete: boolean = false;
  @ViewChildren('projectCombobox') projectComboboxs:  QueryList<ProjectSelectDropdownComponent>;
  constructor(
    private vpnSiteToSiteService: VpnSiteToSiteService, 
    private router: Router, 
    private notification: NzNotificationService,
  ) {
  }

  regionChanged(region: RegionModel) {
    console.log(region);
    
    this.region = region.regionId;
    if(this.projectComboboxs && this.projectComboboxs.length > 0){
      this.projectComboboxs.forEach(element => {
        element.loadProjects(true, region.regionId);
    })
    }
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.projectObject = project;
    this.project = project ? project.id : 0;
    this.getData(true)
  }
  

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    if(this.project && !this.projectObject && localStorage.getItem('projects') ){
      this.projectObject = JSON.parse(localStorage.getItem('projects')).find(x => Number(x.id) == Number(this.project)) ? JSON.parse(localStorage.getItem('projects')).find(x => Number(x.id) == Number(this.project)) : null;
    }
  }

  getData(isBegin) {
    this.isLoading = true
    this.vpnSiteToSiteService.getVpnSiteToSite(this.project)
      .subscribe(data => {
        if(data){
          this.isLoading = false
          this.response = data.body
          console.log(this.response);
          
        }
      if (isBegin) {
        this.isBegin = this.response ? false : true;
      }
    }, error => {
      this.isLoading = false;
      this.response = null;
      console.log(error);
      if (isBegin) {
        this.isBegin = this.response ? false : true;
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
