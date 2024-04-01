import {Component, Inject, OnInit} from '@angular/core';
import {ProjectModel} from "../../../../../shared/models/project.model";
import {RegionModel} from "../../../../../shared/models/region.model";
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
import {ProjectService} from "../../../../../shared/services/project.service";
import {getCurrentRegionAndProject} from "@shared";

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

  form = new FormGroup({
    select: new FormControl('', {validators: [Validators.required]}),
    name: new FormControl('', {validators: [Validators.required]}),
    description: new FormControl('', {}),
  });

  projectChange(project: ProjectModel) {
    this.projectId = project.id;
    this.router.navigate(['/app-smart-cloud/backup-volume']);
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.projectService.getByRegion(this.regionId).subscribe(data => {
      if (data.length) {
        localStorage.setItem("projectId", data[0].id.toString())
        this.router.navigate(['/app-smart-cloud/backup-volume']);
      }
    });
  }

  backToList() {
    this.router.navigate(['/app-smart-cloud/volumes']);
  }

  createBackup() {
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
    createBackupVolumeOrderData.note = 'tạo backup volume';
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
        this.notification.success('Thành công', 'Yêu cầu tạo backup volume đã được gửi đi')
      }
    );
    this.router.navigate(['/app-smart-cloud/backup-volume']);
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
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
  }

  changeSelectdPackage(event: any) {
    this.selectedPackage = event;
  }
}
