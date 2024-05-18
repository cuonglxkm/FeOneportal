import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackupVmService } from '../../../../../../shared/services/backup-vm.service';
import { BackupVolumeService } from '../../../../../../shared/services/backup-volume.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PackageBackupService } from '../../../../../../shared/services/package-backup.service';
import { ProjectModel, ProjectService, RegionModel } from '../../../../../../../../../../libs/common-utils/src';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { getCurrentRegionAndProject } from '@shared';

@Component({
  selector: 'one-portal-create-backup-volume-normal',
  templateUrl: './create-backup-volume-normal.component.html',
  styleUrls: ['./create-backup-volume-normal.component.less']
})
export class CreateBackupVolumeNormalComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  validateForm: FormGroup<{
    volumeId: FormControl<number>;
    backupName: FormControl<string>;
    backupInstanceOfferId: FormControl<number>;
    description: FormControl<string>;
    scheduleId: FormControl<number>;
    backupPacketId: FormControl<number>;
    customerId: FormControl<number>
  }> = this.fb.group({
    volumeId: [0, [Validators.required]],
    backupName: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      Validators.maxLength(50)]],
    backupInstanceOfferId: [0, [Validators.required]],
    description: ['', [Validators.maxLength(500)]],
    scheduleId: [0, [Validators.required, Validators.required]],
    backupPacketId: [1, [Validators.required]],
    customerId: [0, [Validators.required]]
  });

  volumeIdParam: any;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private backupVmService: BackupVmService,
              private backupVolumeService: BackupVolumeService,
              private notification: NzNotificationService,
              private backupPackageService: PackageBackupService,
              private projectService: ProjectService,
              private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  regionChanged(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/backup-volume']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  userChaged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/backup-volume']);
  }

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    if (this.activatedRoute.snapshot.paramMap.get('volumeId') != undefined || this.activatedRoute.snapshot.paramMap.get('volumeId') != null) {
      this.volumeIdParam = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('volumeId'));
      this.validateForm.controls.volumeId.setValue(this.volumeIdParam);
    } else {
      this.volumeIdParam = null;
    }
  }

}
