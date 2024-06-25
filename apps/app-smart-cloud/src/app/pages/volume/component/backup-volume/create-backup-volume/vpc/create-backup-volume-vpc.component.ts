import { Component, Inject, OnInit } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackupVmService } from '../../../../../../shared/services/backup-vm.service';
import { VolumeService } from '../../../../../../shared/services/volume.service';
import { BackupVolumeService } from '../../../../../../shared/services/backup-volume.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PackageBackupService } from '../../../../../../shared/services/package-backup.service';
import { ProjectService } from '../../../../../../shared/services/project.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { BaseResponse, ProjectModel, RegionModel } from '../../../../../../../../../../libs/common-utils/src';
import { VolumeDTO } from '../../../../../../shared/dto/volume.dto';
import { CreateBackupVolumeOrderData, FormCreateBackupVolume } from '../../backup-volume.model';
import { SizeInCloudProject } from '../../../../../../shared/models/project.model';

@Component({
  selector: 'one-portal-create-backup-volume-vpc',
  templateUrl: './create-backup-volume-vpc.component.html',
  styleUrls: ['./create-backup-volume-vpc.component.less'],
})
export class CreateBackupVolumeVpcComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  validateForm: FormGroup<{
    volumeId: FormControl<number>;
    backupName: FormControl<string>;
    backupInstanceOfferId: FormControl<number>;
    description: FormControl<string>;
    scheduleId: FormControl<number>;
    customerId: FormControl<number>
  }> = this.fb.group({
    volumeId: [0, [Validators.required]],
    backupName: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      Validators.maxLength(50), this.validateDuplicateName.bind(this)]],
    backupInstanceOfferId: [0, [Validators.required]],
    description: ['', [Validators.maxLength(500)]],
    scheduleId: [0, [Validators.required, Validators.required]],
    customerId: [0, [Validators.required]]
  });

  volumeIdParam: any;
  listName: string[] = []
  listVolumes: VolumeDTO[]
  isLoading: boolean = false
  volumeInfo: VolumeDTO = new VolumeDTO()



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

  getDataByVolumeId(id) {
    this.volumeService.getVolumeById(id, this.project).subscribe(data => {
      this.volumeInfo = data
    })
  }

  onSelectedVolume(value) {
    if(value) {
      console.log('selected', value);
      this.getDataByVolumeId(value)
    }
  }

  createBackupVolume() {
    this.isLoading = true
    let formCreateBackupVolume = new FormCreateBackupVolume()
    formCreateBackupVolume.volumeId = this.validateForm.controls.volumeId.value
    formCreateBackupVolume.description = this.validateForm.controls.description.value
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

  projectDetail: SizeInCloudProject

  getInfoProjectVpc(id) {
    this.isLoading = true
    this.projectService.getProjectVpc(id).subscribe(data => {
      this.projectDetail = data
      this.isLoading = false
    })
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

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.getListBackupVolumes()
    if (this.activatedRoute.snapshot.paramMap.get('volumeId') != undefined || this.activatedRoute.snapshot.paramMap.get('volumeId') != null) {
      console.log('here')
      this.volumeIdParam = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('volumeId'));
      this.validateForm.controls.volumeId.setValue(this.volumeIdParam);
      this.getDataByVolumeId(this.volumeIdParam)
    } else {
      this.volumeIdParam = null;
      this.getListVolumes()
    }

    this.getInfoProjectVpc(this.project);
  }
}
