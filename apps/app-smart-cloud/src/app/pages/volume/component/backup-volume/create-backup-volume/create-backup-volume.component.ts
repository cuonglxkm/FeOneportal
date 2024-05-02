import {Component, Inject, OnInit} from '@angular/core';
import {
  CreateBackupVolumeOrderData,
  CreateBackupVolumeSpecification,
  VolumeDTO
} from "../../../../../shared/dto/volume.dto";
import {ActivatedRoute, Router} from "@angular/router";
import {BackupVmService} from "../../../../../shared/services/backup-vm.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {FormControl, FormGroup, Validators} from "@angular/forms";
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
  form = new FormGroup({
    select: new FormControl('', {validators: [Validators.required]}),
    name: new FormControl('', {validators: [Validators.required]}),
    description: new FormControl('', {}),
  });

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
    const ax = {
      volumeId: this.idVolume,
      backupName: this.form.controls['name'].value,
      description: this.form.controls['description'].value,
      backupPackageId: this.form.controls['select'].value,
      backupScheduleId: null,
    }

    let userId = this.tokenService.get()?.userId;

    let createBackupVolumeSpecification = new CreateBackupVolumeSpecification();
    createBackupVolumeSpecification.volumeId = ax.volumeId;
    createBackupVolumeSpecification.description = ax.description;
    createBackupVolumeSpecification.backupPackageId = +ax.backupPackageId;
    createBackupVolumeSpecification.customerId = userId;
    createBackupVolumeSpecification.regionId = this.regionId;
    createBackupVolumeSpecification.serviceName = ax.backupName;
    createBackupVolumeSpecification.serviceType = 8;

    console.log(createBackupVolumeSpecification);

    let createBackupVolumeOrderData = new CreateBackupVolumeOrderData();
    createBackupVolumeOrderData.customerId = userId;
    createBackupVolumeOrderData.createdByUserId = userId;
    createBackupVolumeOrderData.note = this.i18n.fanyi('app.input.backup.volume.note');
    createBackupVolumeOrderData.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(createBackupVolumeSpecification),
        specificationType: 'volumebackup_create',
        price: 0,
        serviceDuration: 1
      }
    ]
    console.log(createBackupVolumeOrderData);

    this.backupVolumeService.createBackupVolume(createBackupVolumeOrderData).subscribe(
      () => {
        this.isLoading = false
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.backup.volume.request.create'))
        this.router.navigate(['/app-smart-cloud/backup-volume']);
      }
    );

  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(data => {
      this.idVolume = data['idVolume'];
      this.nameVolume = data['nameVolume'];
      this.startDate = data['startDate'];
      this.endDate = data['endDate'];
      this.tokenService.get()?.userId
    });

    this.backupPackageService.search(null, null, 9999, 1).subscribe(data => {
      this.listOfPackage = data.records
      console.log('backup package', this.listOfPackage)
    })

    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
  }

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private backupVmService: BackupVmService,
              private backupVolumeService: BackupVolumeService,
              private notification: NzNotificationService,
              private backupPackageService: PackageBackupService,
              private projectService: ProjectService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  changeSelectdPackage(event: any) {
    this.selectedPackage = event;
  }
}
