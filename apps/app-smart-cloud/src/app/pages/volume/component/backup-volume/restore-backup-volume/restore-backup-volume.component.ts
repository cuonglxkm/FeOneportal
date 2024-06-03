import { Component, Inject, OnInit } from '@angular/core';
import { ProjectModel, RegionModel } from '../../../../../../../../../libs/common-utils/src';
import { ActivatedRoute, Router } from '@angular/router';
import { BackupVolumeService } from '../../../../../shared/services/backup-volume.service';
import { ProjectService } from '../../../../../shared/services/project.service';
import { PackageBackupService } from '../../../../../shared/services/package-backup.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { getCurrentRegionAndProject } from '@shared';
import { SizeInCloudProject } from '../../../../../shared/models/project.model';
import { BackupVolume } from '../backup-volume.model';
import { PackageBackupModel } from '../../../../../shared/models/package-backup.model';

@Component({
  selector: 'one-portal-restore-backup-volume',
  templateUrl: './restore-backup-volume.component.html',
  styleUrls: ['./restore-backup-volume.component.less'],
})
export class RestoreBackupVolumeComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = true;

  idBackupVolume: number;

  projectDetail: SizeInCloudProject

  backupVolume: BackupVolume;
  backupPackageDetail: PackageBackupModel = new PackageBackupModel();

  typeVpc: number;

  constructor(private router: Router,
              private backupVolumeService: BackupVolumeService,
              private activatedRoute: ActivatedRoute,
              private projectService: ProjectService,
              private backupPackageService: PackageBackupService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  regionChanged(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/backup-volume'])
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.typeVpc = project?.type
    // this.getListVolume(true);
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/backup-volume'])
  }

  getDetailBackupVolume(id) {
    this.isLoading = true
    this.backupVolumeService.detail(id).subscribe(data => {
      this.backupVolume = data;
      this.isLoading = false
      if(this.backupVolume?.backupPackageId != null) {
        this.backupPackageService.detail(this.backupVolume?.backupPackageId).subscribe(data => {
          this.backupPackageDetail = data;
        });
      }
    }, error => {
      this.isLoading = false
      this.router.navigate(['/app-smart-cloud/backup-volume'])
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('volume.notification.access.denied'))
    })
  }

  getInfoProjectVpc(id) {
    this.projectService.getProjectVpc(id).subscribe(data => {
      this.projectDetail = data
    })
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.idBackupVolume = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'))
    this.getDetailBackupVolume(this.idBackupVolume);
    this.getInfoProjectVpc(this.idBackupVolume);
  }
}
