import { Component, OnInit } from '@angular/core';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { ActivatedRoute, Router } from '@angular/router';
import { BackupVmService } from '../../../shared/services/backup-vm.service';
import { getCurrentRegionAndProject } from '@shared';
import { BackupVm } from '../../../shared/models/backup-vm';

@Component({
  selector: 'one-portal-restore-backup-vm',
  templateUrl: './restore-backup-vm.component.html',
  styleUrls: ['./restore-backup-vm.component.less'],
})
export class RestoreBackupVmComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  backupVmModel: BackupVm;

  constructor(private router: Router,
              private backupService: BackupVmService,
              private activatedRoute: ActivatedRoute) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
    this.router.navigate(['/app-smart-cloud/backup-vm'])
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
    // this.router.navigate(['/app-smart-cloud/backup-vm'])
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/backup-vm'])
  }

  getDetailBackupById(id) {
    this.backupService.detail(id).subscribe(data => {
      this.backupVmModel = data
    })
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    const idBackup = this.activatedRoute.snapshot.paramMap.get('id');
    if(idBackup != undefined || idBackup != null) {
      this.getDetailBackupById(idBackup);
    }
  }
}
