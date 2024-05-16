import {Component, Inject, OnInit} from '@angular/core';
import {
  CreateBackupVolumeOrderData,
  CreateBackupVolumeSpecification,
  VolumeDTO
} from "../../../../../shared/dto/volume.dto";
import {ActivatedRoute, Router} from "@angular/router";
import {BackupVmService} from "../../../../../shared/services/backup-vm.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import {BackupVolumeService} from "../../../../../shared/services/backup-volume.service";
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {PackageBackupService} from "../../../../../shared/services/package-backup.service";
import {PackageBackupModel} from "../../../../../shared/models/package-backup.model";
import {getCurrentRegionAndProject} from "@shared";
import { ProjectModel, RegionModel, ProjectService } from '../../../../../../../../../libs/common-utils/src';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-create-backup-volume',
  templateUrl: './create-backup-volume.component.html',
  styleUrls: ['./create-backup-volume.component.less'],
})
export class CreateBackupVolumeComponent implements OnInit {
  receivedData: VolumeDTO;
  regionId: any;
  projectId: any;
  idVolume: any;
  startDate: any;
  endDate: any;
  nameVolume: any;
  listOfPackage: PackageBackupModel[];
  selectedPackage: any;

  isLoading: boolean = false

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

  projectChange(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/backup-volume']);
  }

  onRegionChange(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/backup-volume']);
  }

  backToList() {
    this.router.navigate(['/app-smart-cloud/volumes']);
  }

  createBackup() {
    this.isLoading = true
    //todo call api anh sucribe

    // let userId = this.tokenService.get()?.userId;
    //
    // let createBackupVolumeSpecification = new CreateBackupVolumeSpecification();
    // createBackupVolumeSpecification.volumeId = ax.volumeId;
    // createBackupVolumeSpecification.description = ax.description;
    // createBackupVolumeSpecification.backupPackageId = +ax.backupPackageId;
    // createBackupVolumeSpecification.customerId = userId;
    // createBackupVolumeSpecification.regionId = this.regionId;
    // createBackupVolumeSpecification.serviceName = ax.backupName;
    // createBackupVolumeSpecification.serviceType = 8;
    //
    // console.log(createBackupVolumeSpecification);
    //
    // let createBackupVolumeOrderData = new CreateBackupVolumeOrderData();
    // createBackupVolumeOrderData.customerId = userId;
    // createBackupVolumeOrderData.createdByUserId = userId;
    // createBackupVolumeOrderData.note = this.i18n.fanyi('app.input.backup.volume.note');
    // createBackupVolumeOrderData.orderItems = [
    //   {
    //     orderItemQuantity: 1,
    //     specification: JSON.stringify(createBackupVolumeSpecification),
    //     specificationType: 'volumebackup_create',
    //     price: 0,
    //     serviceDuration: 1
    //   }
    // ]
    // console.log(createBackupVolumeOrderData);
    //
    // this.backupVolumeService.createBackupVolume(createBackupVolumeOrderData).subscribe(
    //   () => {
    //     this.isLoading = false
    //     this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.backup.volume.request.create'))
    //     this.router.navigate(['/app-smart-cloud/backup-volume']);
    //   }
    // );

  }

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;

    if (this.activatedRoute.snapshot.paramMap.get('volumeId') != undefined || this.activatedRoute.snapshot.paramMap.get('volumeId') != null) {
      this.volumeIdParam = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('volumeId'));
      this.validateForm.controls.volumeId.setValue(this.volumeIdParam)
    } else {
      this.volumeIdParam = null;
    }
  }
}
