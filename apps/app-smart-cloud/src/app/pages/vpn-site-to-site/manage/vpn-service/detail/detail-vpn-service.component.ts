import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { getCurrentRegionAndProject } from '@shared';
import { RegionModel, ProjectModel } from '../../../../../../../../../libs/common-utils/src';
import { ActivatedRoute, Router } from '@angular/router';
import { VPNServiceDetail } from 'src/app/shared/models/vpn-service';
import { VpnServiceService } from 'src/app/shared/services/vpn-service.service';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { I18NService } from '@core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';


@Component({
  selector: 'one-portal-detail-vpn-service',
  templateUrl: './detail-vpn-service.component.html',
  styleUrls: ['./detail-vpn-service.component.less'],
})
export class DetailVpnServiceComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  isLoading: boolean = false

  vpnService: VPNServiceDetail = new VPNServiceDetail();
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  
  constructor(private vpnServiceService: VpnServiceService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
    ) {
}
ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    this.getVpnServiceById(this.activatedRoute.snapshot.paramMap.get('id'))
  }
  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
  }

  userChangeProject(){
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
  }

  getVpnServiceById(id) {
    this.isLoading = true
    this.vpnServiceService.getVpnServiceById(id,this.project,this.region).subscribe(data => {
      this.vpnService = data;
      this.isLoading = false;
    }, error => {
      this.vpnService = null;
      this.isLoading = false;
      if (error.error.detail.includes('made requires authentication') || error.error.message.includes('could not be found')) {
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          'Bản ghi không tồn tại'
        );
        this.router.navigateByUrl('/app-smart-cloud/vpn-site-to-site')
      }
    })
  }

}
