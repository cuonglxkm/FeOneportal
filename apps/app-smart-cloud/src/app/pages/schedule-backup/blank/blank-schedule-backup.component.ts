import { Component } from '@angular/core';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-blank-schedule-backup',
  templateUrl: './blank-schedule-backup.component.html',
  styleUrls: ['./blank-schedule-backup.component.less'],
})
export class BlankScheduleBackupComponent {
  region: number;

  project: number;

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }
}
