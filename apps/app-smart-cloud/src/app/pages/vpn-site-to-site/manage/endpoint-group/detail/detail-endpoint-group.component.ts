import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { getCurrentRegionAndProject } from '@shared';
import { FormDetailEndpointGroup } from 'src/app/shared/models/endpoint-group';
import { EndpointGroupService } from 'src/app/shared/services/endpoint-group.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RegionModel, ProjectModel } from '../../../../../../../../../libs/common-utils/src';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { I18NService } from '@core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-detail-endpoint-group',
  templateUrl: './detail-endpoint-group.component.html',
  styleUrls: ['./detail-endpoint-group.component.less'],
})
export class DetailEndpointGroupComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false;

  endpointGroup: FormDetailEndpointGroup = new FormDetailEndpointGroup();
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(
    private endpointGroupService: EndpointGroupService,
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

  getEndpointGroupById(id) {
    this.isLoading = true;
    this.endpointGroupService
      .getEndpointGroupById(id, this.project, this.region)
      .subscribe(
        (data) => {
          this.endpointGroup = data;
          console.log(data);

          this.isLoading = false;
        },
        (error) => {
          this.endpointGroup = null;
          this.isLoading = false;
          if (error.error.detail.includes('made requires authentication') || error.error.message.includes('could not be found')) {
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              'Bản ghi không tồn tại'
            );
            this.router.navigate(['/app-smart-cloud/vpn-site-to-site'], {
              queryParams: {
                tab: 3,
              },
            });
          }
        }
      );
  }

  ngOnInit() {
    this.getEndpointGroupById(this.activatedRoute.snapshot.paramMap.get('id'));
  }
}
