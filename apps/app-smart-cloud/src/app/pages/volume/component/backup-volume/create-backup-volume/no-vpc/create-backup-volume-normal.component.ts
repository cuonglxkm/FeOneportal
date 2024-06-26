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
import { CreateBackupVolumeOrderData, FormCreateBackupVolume } from '../../backup-volume.model';
import { CreateBackupVmOrderData } from '../../../../../../shared/models/backup-vm';

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
  listVolumes:VolumeDTO[]
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
    this.backupPackageService.detail(value, this.project).subscribe(data => {
      this.backupPackageDetail = data;
    });
  }

  getBackupPackage() {
    this.isLoadingBackupPackage = true;
    this.backupPackageService.search(null, null, this.project, this.region, 9999, 1).subscribe(data => {
      this.isLoadingBackupPackage = false;
      data.records.forEach(item => {
        if(['ACTIVE', 'AVAILABLE'].includes(item.status)) {
          this.backupPackages?.push(item)
        }
      }, error => {
        this.isLoadingBackupPackage = false;
        this.notification.error(error.statusText, this.i18n.fanyi('app.failData'))
      })
      console.log('backup package', this.backupPackages);
      this.validateForm.controls.backupPacketId.setValue(this.backupPackages[0].id);
    });
  }

  volumeInfo: VolumeDTO = new VolumeDTO();


  getDataByVolumeId(id) {
    this.volumeService.getVolumeById(id, this.project).subscribe(data => {
      this.volumeInfo = data
    })
  }

  isLoadingVolume: boolean = false
  getListVolumes() {
    this.isLoadingVolume = true
    this.volumeService.getVolumes(this.tokenService.get()?.userId, this.project, this.region, 9999, 1, '', '').subscribe(data => {
      this.isLoadingVolume = false
      this.listVolumes = data.records;
      this.listVolumes = this.listVolumes.filter(item => item.status === 'KHOITAO')
      this.validateForm.controls.volumeId.setValue(this.listVolumes[0]?.id)
    }, error => {
      this.isLoadingVolume = false
      this.notification.error(error.statusText, this.i18n.fanyi('app.failData'))
    })
  }

  onSelectedVolume(value) {
    if(value) {
      console.log('selected', value);
      this.getDataByVolumeId(value)
    }
  }

  createBackupVolumeNormal() {
    this.isLoading = true
    let formCreateBackupVolume = new FormCreateBackupVolume()
    formCreateBackupVolume.volumeId = this.validateForm.controls.volumeId.value
    formCreateBackupVolume.description = this.validateForm.controls.description.value
    formCreateBackupVolume.backupPackageId = this.validateForm.controls.backupPacketId.value
    formCreateBackupVolume.customerId = this.tokenService.get()?.userId
    formCreateBackupVolume.userEmail = this.tokenService.get()?.email
    formCreateBackupVolume.actorEmail = this.tokenService.get()?.email
    formCreateBackupVolume.projectId = this.project
    formCreateBackupVolume.vpcId = this.project
    formCreateBackupVolume.regionId = this.region
    formCreateBackupVolume.serviceName = this.validateForm.controls.backupName.value
    formCreateBackupVolume.serviceType = 8
    formCreateBackupVolume.actionType = 0
    formCreateBackupVolume.serviceInstanceId = 0
    formCreateBackupVolume.offerId = 0
    formCreateBackupVolume.createDateInContract = null
    formCreateBackupVolume.saleDept =  null
    formCreateBackupVolume.saleDeptCode = null
    formCreateBackupVolume.contactPersonEmail = null
    formCreateBackupVolume.contactPersonPhone = null
    formCreateBackupVolume.contactPersonName = null
    formCreateBackupVolume.am = null
    formCreateBackupVolume.amManager = null
    formCreateBackupVolume.note = null
    formCreateBackupVolume.isTrial = false
    formCreateBackupVolume.couponCode = null
    formCreateBackupVolume.dhsxkd_SubscriptionId = null
    formCreateBackupVolume.dSubscriptionNumber = null
    formCreateBackupVolume.dSubscriptionType = null
    formCreateBackupVolume.oneSMEAddonId = null
    formCreateBackupVolume.oneSME_SubscriptionId = null
    formCreateBackupVolume.isSendMail = true
    formCreateBackupVolume.typeName = "SharedKernel.IntegrationEvents.Orders.Specifications.VolumeBackupCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null"

    console.log(formCreateBackupVolume);

    let createBackupVolumeOrderData = new CreateBackupVolumeOrderData();
    createBackupVolumeOrderData.customerId = this.tokenService.get()?.userId;
    createBackupVolumeOrderData.createdByUserId = this.tokenService.get()?.userId;
    createBackupVolumeOrderData.note = this.i18n.fanyi('app.input.backup.volume.note');
    createBackupVolumeOrderData.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(formCreateBackupVolume),
        specificationType: 'volumebackup_create',
        price: 0,
        serviceDuration: 1
      }
    ];
    console.log(createBackupVolumeOrderData);

    this.backupVolumeService.createBackupVolume(createBackupVolumeOrderData).subscribe(data => {
      this.isLoading = false;
      console.log('data create', data);
      this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.backup.volume.notification.create.request.send'));
      this.router.navigate(['/app-smart-cloud/backup-volume']);
    });
  }

  getListBackupVolumes() {
    this.isLoading = true
    this.backupVolumeService.getListBackupVolume(this.region, this.project, '', '', 99999, 1).subscribe(data => {
      this.isLoading = false
      data?.records.forEach(item => {
        if (this.listName.length > 0) {
          this.listName.push(item.name);
        } else {
          this.listName = [item.name];
        }
      })
    }, error =>  {
      this.isLoading = false
      this.notification.error(error.statusText, this.i18n.fanyi('app.failData'))
    });
  }

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.getListBackupVolumes();
    if (this.activatedRoute.snapshot.paramMap.get('volumeId') != undefined || this.activatedRoute.snapshot.paramMap.get('volumeId') != null) {
      console.log('here')
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
