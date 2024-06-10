import { Component, Inject } from '@angular/core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { ActivatedRoute, Router } from '@angular/router';
import { VolumeService } from '../../../shared/services/volume.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-snapshot-detail',
  templateUrl: './snapshot-detail.component.html',
  styleUrls: ['./snapshot-detail.component.less'],
})
export class SnapshotDetailComponent {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  data: any;
  id: any

  constructor(@Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private service: VolumeService,
              private notification: NzNotificationService) {
  }

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.id = id;
    this.loadData(id);
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  private loadData(id: string) {
    this.service.getDetailSnapshot(id).subscribe(
      data => {
        this.data = data;
      }
    )
  }

  userChanged($event: any) {
    this.router.navigate(['/app-smart-cloud/load-balancer/list'])
  }
}
