import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { RegionModel, ProjectModel } from '../../../../../../../../../libs/common-utils/src';
import { VpnConnectionDetail } from 'src/app/shared/models/vpn-connection';
import { VpnConnectionService } from 'src/app/shared/services/vpn-connection.service';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { I18NService } from '@core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-detail-vpn-connection',
  templateUrl: './detail-vpn-connection.component.html',
  styleUrls: ['./detail-vpn-connection.component.less'],
})
export class DetailVpnConnectionComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false;
  localEndpointGroup: string = ''
  remoteEndpointGroup: string = ''
  vpnConnection: VpnConnectionDetail = new VpnConnectionDetail();
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.getVpnConnectionById(this.activatedRoute.snapshot.paramMap.get('id'))
  }

  constructor(
    private vpnConnectionService: VpnConnectionService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

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

  getVpnConnectionById(id) {
    this.isLoading = true;
    this.vpnConnectionService
      .getVpnConnectionById(id, this.project, this.region)
      .subscribe(
        (data) => {
          this.vpnConnection = data;
          const listLocalNetwork = data.localNetwork.map((item) => {
            return item
          }).join(' , ')
          const listRemoteNetwork = data.remoteNetwork.map((item) => {
            return item
          }).join(' , ')
          
          this.localEndpointGroup = data.localEndpointGroup + ' (' + listLocalNetwork + ')'
          this.remoteEndpointGroup = data.remoteEnpointGroup + ' (' + listRemoteNetwork + ')'

          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
          if (error.error.message.includes('made requires authentication') || error.error.message.includes('could not be found')) {
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              'Bản ghi không tồn tại'
            );
            this.router.navigate(['/app-smart-cloud/vpn-site-to-site'], {
              queryParams: {
                tab: 4,
              },
            });
          }
        }
      );
  }
}
