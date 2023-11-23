import { Component } from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";

@Component({
  selector: 'one-portal-detail-backup-vm',
  templateUrl: './detail-backup-vm.component.html',
  styleUrls: ['./detail-backup-vm.component.less'],
})
export class DetailBackupVmComponent {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }
  projectChanged(project: ProjectModel) {
    this.project = project?.id
    console.log(this.project)
  }
}
