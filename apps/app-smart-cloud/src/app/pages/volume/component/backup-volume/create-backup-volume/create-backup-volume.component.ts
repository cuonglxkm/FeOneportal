import {Component, Inject, OnInit} from '@angular/core';
import {ProjectModel} from "../../../../../shared/models/project.model";
import {RegionModel} from "../../../../../shared/models/region.model";
import {CreateBackupVolumeOrderData, CreateBackupVolumeSpecification, VolumeDTO} from "../../../../../shared/dto/volume.dto";
import {ActivatedRoute, Router} from "@angular/router";
import {BackupVmService} from "../../../../../shared/services/backup-vm.service";
import {BackupPackage} from "../../../../../shared/models/backup-vm";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {BackupVolumeService} from "../../../../../shared/services/backup-volume.service";
import {NzMessageService} from "ng-zorro-antd/message";
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-create-backup-volume',
  templateUrl: './create-backup-volume.component.html',
  styleUrls: ['./create-backup-volume.component.less'],
})
export class CreateBackupVolumeComponent implements OnInit{
  receivedData: VolumeDTO;
  regionId: any;
  projectId: any;
  idVolume: any;
  startDate: any;
  endDate: any;
  nameVolume: any;
  listOfPackage: BackupPackage[];
  selectedPackage: any;

  form = new FormGroup({
    select: new FormControl('', {validators: [Validators.required]}),
    name: new FormControl('', {validators: [Validators.required]}),
    description: new FormControl('', {}),
  });

  projectChange(project: ProjectModel) {
    this.projectId = project.id;
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
  }
  backToList() {
    this.router.navigate(['/app-smart-cloud/volume']);
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
    this.activatedRoute.queryParams.subscribe(data =>{
      this.idVolume = data['idVolume'];
      this.nameVolume = data['nameVolume'];
      this.startDate = data['startDate'];
      this.endDate = data['endDate'];this.tokenService.get()?.userId
    });

    this.backupVmService.getBackupPackages(this.tokenService.get()?.userId).subscribe(data => {
      this.listOfPackage = data;
    })
  }

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private backupVmService: BackupVmService,
              private backupVolumeService: BackupVolumeService,
              private notification: NzNotificationService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
  }

  changeSelectdPackage(event: any) {
    this.selectedPackage = event;
  }
}
