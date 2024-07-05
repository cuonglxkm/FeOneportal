import { Component, Inject, OnInit } from '@angular/core';
import {BackupVolume} from "../backup-volume.model";
import { ActivatedRoute, Router } from '@angular/router';
import {BackupVolumeService} from "../../../../../shared/services/backup-volume.service";
import { ProjectModel, RegionModel } from '../../../../../../../../../libs/common-utils/src';
import { ProjectService } from 'src/app/shared/services/project.service';
import { getCurrentRegionAndProject } from '@shared';
import { PackageBackupService } from '../../../../../shared/services/package-backup.service';
import { PackageBackupModel } from '../../../../../shared/models/package-backup.model';
import { SizeInCloudProject } from '../../../../../shared/models/project.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-detail-backup-volume',
  templateUrl: './detail-backup-volume.component.html',
  styleUrls: ['./detail-backup-volume.component.less'],
})
export class DetailBackupVolumeComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  idBackupVolume: number;

  backupVolume: BackupVolume;
  backupPackageDetail: PackageBackupModel = new PackageBackupModel();

  isLoading: boolean = true;
  typeVpc: number

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

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
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
        this.backupPackageService.detail(this.backupVolume?.backupPackageId, this.project).subscribe(data => {
          this.backupPackageDetail = data;
        });
      }
    }, error => {
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('volume.notification.access.denied'))
    })
  }
  projectDetail: SizeInCloudProject
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
    this.getDetailBackupVolume(this.idBackupVolume)
    this.getInfoProjectVpc(this.project)
  }
}
