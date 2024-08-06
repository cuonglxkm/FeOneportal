import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  BackupVm,
  BackupVMFormSearch,
  CreateBackupVmOrderData,
  CreateBackupVmSpecification,
  FormCreateBackup,
  VolumeAttachment
} from '../../../../shared/models/backup-vm';
import { InstancesModel } from '../../../instances/instances.model';
import { SecurityGroup } from '../../../../shared/models/security-group';
import { PackageBackupModel } from '../../../../shared/models/package-backup.model';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { VolumeDTO } from '../../../../shared/dto/volume.dto';
import { BackupVmService } from '../../../../shared/services/backup-vm.service';
import { InstancesService } from '../../../instances/instances.service';
import { PackageBackupService } from '../../../../shared/services/package-backup.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VolumeService } from '../../../../shared/services/volume.service';
import { CatalogService } from '../../../../shared/services/catalog.service';
import {
  ProjectModel,
  RegionModel,
} from '../../../../../../../../libs/common-utils/src';
import { getCurrentRegionAndProject } from '@shared';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { SizeInCloudProject } from 'src/app/shared/models/project.model';
import { ProjectService } from 'src/app/shared/services/project.service';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

@Component({
  selector: 'one-portal-create-backup-vm-vpc',
  templateUrl: './create-backup-vm-vpc.component.html',
  styleUrls: ['./create-backup-vm-vpc.component.less']
})
export class CreateBackupVmVpcComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  typeVpc: number;
  instanceIdParam: number;
  listName: string[] = [];
  listBackupVM: BackupVm[] = [];
  instance: InstancesModel;
  listInstances: InstancesModel[] = [];
  isLoading: boolean = false;
  securityGroups: SecurityGroup[] = [];
  securityGroupSelected = []
  volumeAttachments: VolumeAttachment[] = [];
  backupPackages: PackageBackupModel[] = [];
  backupPackageDetail: PackageBackupModel = new PackageBackupModel();
  sizeOfOs: number;
  sizeOfVlAttach: number = 0;

  totalStorageVolumeAttach: number = 0;

  validateForm: FormGroup<{
    instanceId: FormControl<number>;
    backupName: FormControl<string>;
    backupInstanceOfferId: FormControl<number>;
    volumeToBackupIds: FormControl<number[]>;
    securityGroupToBackupIds: FormControl<string[]>;
    projectId: FormControl<number>;
    description: FormControl<string>;
    scheduleId: FormControl<number>;
    backupPacketId: FormControl<number>;
    customerId: FormControl<number>
  }> = this.fb.group({
    instanceId: [0, [Validators.required]],
    backupName: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      Validators.maxLength(50),
      this.validateDuplicateName.bind(this)]],
    backupInstanceOfferId: [0, [Validators.required]],
    volumeToBackupIds: [[] as number[]],
    securityGroupToBackupIds: [[] as string[]],
    projectId: [0, [Validators.required]],
    description: ['', [Validators.maxLength(500)]],
    scheduleId: [0, [Validators.required, Validators.required]],
    backupPacketId: [1, [Validators.required]],
    customerId: [0, [Validators.required]]
  });

  volumeAttachSelected: VolumeDTO[] = [];
  formCreateBackup: FormCreateBackup = new FormCreateBackup();
  projectDetail: SizeInCloudProject

  instanceSelected: any;

  projectName: string;

  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  constructor(private backupVmService: BackupVmService,
              private instanceService: InstancesService,
              private backupPackageService: PackageBackupService,
              private activatedRoute: ActivatedRoute,
              private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private volumeService: VolumeService,
              private router: Router,
              private catalogService: CatalogService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private projectService: ProjectService) {
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

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.router.navigate(['/app-smart-cloud/backup-vm']);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.typeVpc = project?.type;
    this.projectName = project?.projectName;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/backup-vm']);
  }

  getListBackupVm() {
    let formSearch = new BackupVMFormSearch();
    formSearch.projectId = this.project;
    formSearch.customerId = this.tokenService.get()?.userId;
    formSearch.currentPage = 1;
    formSearch.pageSize = 9999;
    formSearch.regionId = this.region;
    this.backupVmService.search(formSearch).subscribe(data => {
      this.listBackupVM = data.records;
      data?.records.forEach(item => {
        this.listName?.push(item?.name);
      });
      console.log('listname', this.listName);
    });
  }

  //id: id của máy ảo

  getVolumeInstanceAttachment(id: number) {
    this.isLoading = true;
    this.backupVmService.getVolumeInstanceAttachment(id).subscribe(data => {
      this.volumeAttachments = data;
      this.isLoading = false;
      console.log('volume attach', this.volumeAttachments);
    });
  }

  getDataByInstanceId(id) {
    this.securityGroupSelected = [];
    this.instanceService.getInstanceById(id).subscribe(data => {
      this.instance = data;
      this.isLoading = true;
      this.instanceService.getAllSecurityGroupByInstance(this.instance.cloudId, this.instance.regionId,
        this.instance.customerId, this.instance.projectId).subscribe(data => {
        this.securityGroups = data;
        // this.securityGroups = data;
        this.securityGroups.forEach(item => {
          if(item.name.toUpperCase() === 'DEFAULT') {
            this.securityGroupSelected?.push(item.id)
          }
        })
        console.log('sg sag', this.securityGroups);
        console.log('sg', this.securityGroupSelected);
      }, error => {
        this.isLoading = false
        this.securityGroups = []
      });
      this.getVolumeInstanceAttachment(this.instance.id);
    });
  }


  isLoadingInstance: boolean = false
  getListInstances() {
    this.isLoadingInstance = true;
    this.instanceService.search(1, 9999, this.region, this.project, '', '', true, this.tokenService.get()?.userId)
      .subscribe(data => {
        console.log('data', data);
        this.isLoadingInstance = false;

        this.listInstances = data.records;
        this.listInstances = this.listInstances.filter(item => item.taskState === 'ACTIVE');
        if(this.instanceIdParam == undefined || this.instanceIdParam == null) {
          this.instanceSelected = this.listInstances[0].id;
        } else {
          this.instanceSelected = this.instanceIdParam
        }

        console.log('data', this.instance);
      }, error => {
        this.isLoadingInstance = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.failData'));
      });
  }

  onSelectedInstance(value) {
    console.log('selected', value);
    this.instanceSelected = value
    this.validateForm.controls.volumeToBackupIds.reset();
    this.validateForm.controls.securityGroupToBackupIds.reset();
    if (this.instanceSelected != undefined) {
      this.getDataByInstanceId(this.instanceSelected)
    }
  }

  getBackupPackage() {
    this.isLoading = true;
    this.backupPackageService.search(null, null, this.project, this.region,9999, 1).subscribe(data => {
      this.backupPackages = data.records;
      this.isLoading = false;
      console.log('backup package', this.backupPackages);
      this.validateForm.controls.backupPacketId.setValue(this.backupPackages[0].id);
    });
  }

  onChangeBackupPackage(value) {
    this.backupPackageService.detail(value, this.project).subscribe(data => {
      this.backupPackageDetail = data;
    });
  }

  onSelectedVolume(value) {
    console.log('value', value);
    this.sizeOfVlAttach = 0;
    this.volumeAttachSelected = [];
    if (value.length >= 1) {
      value.forEach(item => {
        this.volumeService.getVolumeById(item, this.project).subscribe(data => {
          this.volumeAttachSelected?.push(data);
          this.sizeOfVlAttach += data?.sizeInGB;
        });
      });
    } else {
      this.volumeAttachSelected = [];
      this.sizeOfVlAttach = 0;
    }
  }

  offerId: number = 0;

  getOfferBackupVm() {
    this.catalogService.getCatalogOffer(this.project, this.region, '', 'backup-vm').subscribe(data => {
      data?.forEach(item => {
        this.catalogService.getDetailOffer(item.id).subscribe(data2 => {
          this.offerId = data2.id;
        });
      });
    });
  }

  createBackupVmNormal(): void {
    this.isLoading = true;
    if (this.validateForm.valid) {
      console.log(this.validateForm.getRawValue());

      let createBackupVmSpecification = new CreateBackupVmSpecification();
      createBackupVmSpecification.instanceId = this.validateForm.controls.instanceId.value;
      createBackupVmSpecification.backupInstanceOfferId = 0; // dùng để tính giá về sau
      createBackupVmSpecification.volumeToBackupIds = this.validateForm.controls.volumeToBackupIds.value;
      createBackupVmSpecification.securityGroupToBackupIds = this.securityGroupSelected;
      createBackupVmSpecification.description = this.validateForm.controls.description.value.trimStart().trimEnd();
      // createBackupVmSpecification.backupPackageId = this.validateForm.controls.backupPacketId.value;
      createBackupVmSpecification.customerId = this.tokenService.get()?.userId;
      createBackupVmSpecification.actorEmail = this.tokenService.get()?.email;
      createBackupVmSpecification.userEmail = this.tokenService.get()?.email;
      createBackupVmSpecification.vpcId = this.project;
      createBackupVmSpecification.projectId = this.project
      createBackupVmSpecification.regionId = this.region;
      createBackupVmSpecification.serviceName = this.validateForm.controls.backupName.value.trimStart().trimEnd();
      createBackupVmSpecification.serviceType = 9; // 9 là backup_vm
      createBackupVmSpecification.actionType = 0; // 0 là create
      createBackupVmSpecification.serviceInstanceId = 0;
      createBackupVmSpecification.createDateInContract = null
      createBackupVmSpecification.saleDept = null
      createBackupVmSpecification.saleDeptCode = null
      createBackupVmSpecification.contactPersonEmail = null
      createBackupVmSpecification.contactPersonPhone = null
      createBackupVmSpecification.contactPersonName = null
      createBackupVmSpecification.am = null
      createBackupVmSpecification.amManager = null
      createBackupVmSpecification.note = null
      createBackupVmSpecification.isTrial = false
      createBackupVmSpecification.offerId = 0
      createBackupVmSpecification.couponCode = null
      createBackupVmSpecification.dhsxkd_SubscriptionId = null
      createBackupVmSpecification.dSubscriptionNumber = null
      createBackupVmSpecification.dSubscriptionType = null
      createBackupVmSpecification.oneSMEAddonId = null
      createBackupVmSpecification.oneSME_SubscriptionId = null
      createBackupVmSpecification.isSendMail = true
      createBackupVmSpecification.typeName = "SharedKernel.IntegrationEvents.Orders.Specifications.InstanceBackupCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null"

      console.log(createBackupVmSpecification);

      let createBackupVmOrderData = new CreateBackupVmOrderData();
      createBackupVmOrderData.customerId = this.tokenService.get()?.userId;
      createBackupVmOrderData.createdByUserId = this.tokenService.get()?.userId;
      createBackupVmOrderData.note = this.i18n.fanyi('app.backup.vm.create.button');
      createBackupVmOrderData.orderItems = [
        {
          orderItemQuantity: 1,
          specification: JSON.stringify(createBackupVmSpecification),
          specificationType: 'instancebackup_create',
          price: 0,
          serviceDuration: 1
        }
      ];
      console.log(createBackupVmOrderData);

      this.backupVmService.create(createBackupVmOrderData).subscribe(data => {
        this.isLoading = false;
        console.log('data create', data);
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.backup.vm.notification.create.request.send'));
        this.router.navigate(['/app-smart-cloud/backup-vm']);
      });

    } else {
      this.isLoading = false;
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  getInfoProjectVpc(id) {
    this.projectService.getProjectVpc(id).subscribe(data => {
      this.projectDetail = data
    })
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;


    this.activatedRoute.queryParams.subscribe(params => {
      const instanceId = params['instanceId'];
      console.log('here');
      console.log('instance id param', instanceId);
      if (instanceId != undefined || instanceId != null) {
        this.instanceIdParam = Number.parseInt(instanceId);
        console.log('volumeId', this.instanceIdParam);
        this.getDataByInstanceId(this.instanceIdParam);
        this.getListInstances();
      } else {
        this.instanceIdParam = null;
        this.getListInstances();
      }
    });

    this.getListBackupVm();
    this.getBackupPackage();

    this.getOfferBackupVm();
    this.getInfoProjectVpc(this.project);
  }
}
