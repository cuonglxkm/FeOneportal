import { Component, OnInit } from '@angular/core';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-restore-backup-vm',
  templateUrl: './restore-backup-vm.component.html',
  styleUrls: ['./restore-backup-vm.component.less'],
})
export class RestoreBackupVmComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  constructor() {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId

  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id

  }

  ngOnInit() {
  }
}
