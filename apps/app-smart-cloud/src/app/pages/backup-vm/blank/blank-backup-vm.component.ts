import { Component } from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";

@Component({
  selector: 'one-portal-blank-backup-vm',
  templateUrl: './blank-backup-vm.component.html',
  styleUrls: ['./blank-backup-vm.component.less'],
})
export class BlankBackupVmComponent {
  region: number;

  project: number;

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }
}
