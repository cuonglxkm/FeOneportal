import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackupVmService } from '../../../../../../shared/services/backup-vm.service';
import { BackupVolumeService } from '../../../../../../shared/services/backup-volume.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PackageBackupService } from '../../../../../../shared/services/package-backup.service';
import {
  BaseResponse,
  ProjectModel,

  RegionModel
} from '../../../../../../../../../../libs/common-utils/src';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { getCurrentRegionAndProject } from '@shared';
import { PackageBackupModel } from '../../../../../../shared/models/package-backup.model';
import { VolumeService } from '../../../../../../shared/services/volume.service';
import { VolumeDTO } from '../../../../../../shared/dto/volume.dto';
import { ProjectService } from 'src/app/shared/services/project.service';

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
      Validators.maxLength(50), this.validateDuplicateName.bind(this)]],
    backupInstanceOfferId: [0, [Validators.required]],
    description: ['', [Validators.maxLength(500)]],
    scheduleId: [0, [Validators.required, Validators.required]],
    backupPacketId: [1, [Validators.required]],
    customerId: [0, [Validators.required]]
  });

  volumeIdParam: any;
  listName: string[] = []
  backupPackageDetail: PackageBackupModel = new PackageBackupModel();
  backupPackages: PackageBackupModel[] = [];
  isLoadingBackupPackage: boolean = false
  listVolumes: BaseResponse<VolumeDTO[]>
  isLoading: boolean = false

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private backupVmService: BackupVmService,
              private volumeService: VolumeService,
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

  validateDuplicateName(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.listName && this.listName.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null;
    }
  }

  onChangeBackupPackage(value) {
    this.backupPackageService.detail(value).subscribe(data => {
      this.backupPackageDetail = data;
    });
  }

  getBackupPackage() {
    this.isLoadingBackupPackage = true;
    this.backupPackageService.search(null, null, 9999, 1).subscribe(data => {
      this.backupPackages = data.records;
      this.isLoadingBackupPackage = false;
      console.log('backup package', this.backupPackages);
      this.validateForm.controls.backupPacketId.setValue(this.backupPackages[0].id);
    });
  }

  volumeInfo: VolumeDTO = new VolumeDTO()

  getDataByVolumeId(id) {
    this.volumeService.getVolumeById(id).subscribe(data => {
      this.volumeInfo = data
    })
  }

  getListVolumes() {
    this.volumeService.getVolumes(this.tokenService.get()?.userId, this.project, this.region, 9999, 1, '', '').subscribe(data => {
      this.listVolumes = data;
      this.validateForm.controls.volumeId.setValue(this.listVolumes[0].id)
    })
  }

  onSelectedVolume(value) {
    console.log('selected', value);
  }

  createBackupVolumeNormal() {

  }
  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    if (this.activatedRoute.snapshot.paramMap.get('volumeId') != undefined || this.activatedRoute.snapshot.paramMap.get('volumeId') != null) {
      this.volumeIdParam = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('volumeId'));
      this.validateForm.controls.volumeId.setValue(this.volumeIdParam);
      this.getDataByVolumeId(this.volumeIdParam)
    } else {
      this.volumeIdParam = null;
      this.getListVolumes()

    }
    this.getBackupPackage()
  }

}
