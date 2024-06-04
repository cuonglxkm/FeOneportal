import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VolumeDTO } from '../../../../../shared/dto/volume.dto';
import { debounceTime } from 'rxjs';
import { VolumeService } from '../../../../../shared/services/volume.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

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

  selectedOption: string = 'current';

  validateForm = new FormGroup({
    formCurrent: new FormGroup({
      volumeId: new FormControl(null as number)
    }),
    formNew: new FormGroup({

    }),
  });

  listVolumes: VolumeDTO[] = [];

  volumeSelected: any;

  constructor(private router: Router,
              private backupVolumeService: BackupVolumeService,
              private activatedRoute: ActivatedRoute,
              private projectService: ProjectService,
              private backupPackageService: PackageBackupService,
              private notification: NzNotificationService,
              private volumeService: VolumeService,
              private cdr: ChangeDetectorRef,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
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

  onSelectionChange(): void {
    console.log('Selected option:', this.selectedOption);
    if (this.selectedOption === 'current') {

    } else if (this.selectedOption === 'new') {

    }
    this.cdr.detectChanges();
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

  getListVolumes() {
    this.isLoading = true
    this.volumeService.getVolumes(this.tokenService.get()?.userId, this.project,
      this.region, 9999, 1, null, null)
      .pipe(debounceTime(500))
      .subscribe(data => {
          this.isLoading = false;
          this.listVolumes = data.records;
          this.validateForm.get('formCurrent').get('volumeId').setValue(this.listVolumes[0]?.id)
      }, error => {
        this.isLoading = false;
        this.listVolumes = [];
        console.log(error);
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.failData'));
      });
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.idBackupVolume = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'))
    this.getDetailBackupVolume(this.idBackupVolume);
    this.getInfoProjectVpc(this.project);
    this.getListVolumes();
  }
}
