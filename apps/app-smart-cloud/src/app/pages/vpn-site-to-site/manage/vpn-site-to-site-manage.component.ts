import { Component, Inject, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { VpnSiteToSiteService } from 'src/app/shared/services/vpn-site-to-site.service';
import { NotificationService, ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { PolicyService } from 'src/app/shared/services/policy.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

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
  isLoadingDelete: boolean = false;
  isCreateOrder: boolean = false;
  isExtendOrder: boolean = false;
  isResizeOrder: boolean = false;
  isDetelePermission: boolean = false;
  selectedIndex = 0;
  @ViewChildren('projectCombobox') projectComboboxs:  QueryList<ProjectSelectDropdownComponent>;
  constructor(
    private vpnSiteToSiteService: VpnSiteToSiteService, 
    private router: Router, 
    private route: ActivatedRoute,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private policyService: PolicyService,
    private notificationService: NotificationService,
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
    this.getData(true);
    this.isCreateOrder = this.policyService.hasPermission("order:Create") &&
    this.policyService.hasPermission("offer:Search") &&
    this.policyService.hasPermission("order:GetOrderAmount");
    this.isExtendOrder = this.policyService.hasPermission("order:Create") &&
    this.policyService.hasPermission("offer:Search") &&
    this.policyService.hasPermission("vpnsitetosites:Get") &&
    this.policyService.hasPermission("order:GetOrderAmount");
    this.isResizeOrder = this.policyService.hasPermission("order:Create") &&
    this.policyService.hasPermission("offer:Search") &&
    this.policyService.hasPermission("vpnsitetosites:Get") &&
    this.policyService.hasPermission("order:GetOrderAmount");
    this.isDetelePermission = this.policyService.hasPermission("vpnsitetosites:Delete");
  }
  

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    if(this.project && !this.projectObject && localStorage.getItem('projects') ){
      this.projectObject = JSON.parse(localStorage.getItem('projects')).find(x => Number(x.id) == Number(this.project)) ? JSON.parse(localStorage.getItem('projects')).find(x => Number(x.id) == Number(this.project)) : null;
    }
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      this.selectedIndex = tab ? +tab : 0;
    });
    this.notificationService.connection.on('UpdateVolume', (message) => {
      if (message) {
        switch (message.actionType) {
          case 'CREATING':
          case 'CREATED':
          case 'RESIZING':
          case 'RESIZED':
          case 'EXTENDING':
          case 'EXTENDED':
          case 'DELETED':
          case 'DELETING':
            this.getData(true);
            break;
        }
      }
    });
  }

  getData(isBegin) {
    this.isLoading = true
    this.vpnSiteToSiteService.getVpnSiteToSite(this.project)
      .subscribe(data => {
        if(data){
          this.isLoading = false
          this.response = data.body
        }
      if (isBegin) {
        this.isBegin = this.response ? false : true;
      }
    }, error => {
      this.isLoading = false;
      this.response = null;
      console.log(error);
      if(error.status == 403){
        this.notification.error(
          error.statusText,
          this.i18n.fanyi('app.non.permission', { serviceName: 'Thông tin VPN Site to Site' })
        );
      }
      if (isBegin) {
        this.isBegin = this.response ? false : true;
      }
    })
  }

  createVpn() {
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site/create']);
  }

  extendVpn() {
    this.router.navigate([`/app-smart-cloud/vpn-site-to-site/extend`]);
  }

  resizeVpn() {
    this.router.navigate([`/app-smart-cloud/vpn-site-to-site/resize`]);
  }

  modalDelete() {
    this.isVisibleDelete = true;
  }

  handleCancelDelete() {
    this.isVisibleDelete = false;
  }

  handleTabChange(event){
    this.router.navigate([`/app-smart-cloud/vpn-site-to-site`], {queryParams: {tab: event}}); 
  }

  handleOkDelete() {
    this.isLoadingDelete = true
    if(this.response['id']){
      this.vpnSiteToSiteService
      .deteleVpnSiteToSite(this.response['id'])
      .subscribe({
        next: (data) => {
          this.notification.success('', 'Xóa VPN site to site thành công');
          this.isVisibleDelete = false;
          this.isLoadingDelete = false
          this.getData(true)
        },
        error: (error) => {
          console.log(error.error);
          this.notification.error('', 'Xóa VPN site to site không thành công');
          this.isLoadingDelete = false
        },
      });
    }
  }
}
