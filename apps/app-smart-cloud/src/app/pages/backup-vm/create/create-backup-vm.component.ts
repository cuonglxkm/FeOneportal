import {Component, Inject, OnChanges, OnInit} from '@angular/core';
import {
  BackupPackage,
  BackupVm,
  BackupVMFormSearch,
  CreateBackupVmOrderData,
  CreateBackupVmSpecification,
  FormCreateBackup,
  VolumeAttachment
} from "../../../shared/models/backup-vm";
import {BackupVmService} from "../../../shared/services/backup-vm.service";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {InstancesModel} from "../../instances/instances.model";
import {InstancesService} from "../../instances/instances.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {SecurityGroup} from "../../../shared/models/security-group";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";

@Component({
  selector: 'one-portal-create-backup-vm',
  templateUrl: './create-backup-vm.component.html',
  styleUrls: ['./create-backup-vm.component.less'],
})
export class CreateBackupVmComponent implements OnInit, OnChanges {

  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false;

  backupVm: BackupVm;

  instance: InstancesModel;

  securityGroups: SecurityGroup[] = []

  securityGroupIds: string[]

  volumeAttachments: VolumeAttachment[] = []

  backupPackages: BackupPackage[] = []

  customerId: number

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
      Validators.pattern(/^[a-zA-Z0-9 ]*$/),
      Validators.minLength(3),
      Validators.maxLength(50),
      this.validateDuplicateName.bind(this)]],
    backupInstanceOfferId: [0, [Validators.required]],
    volumeToBackupIds: [[] as number[]],
    securityGroupToBackupIds: [[] as string[]],
    projectId: [0, [Validators.required]],
    description: ['', [Validators.maxLength(500)]],
    scheduleId: [0, [Validators.required]],
    backupPacketId: [0, [Validators.required]],
    customerId: [0, [Validators.required]],
  });

  formCreateBackup: FormCreateBackup = new FormCreateBackup()
  formSearch: BackupVMFormSearch = new BackupVMFormSearch()

  listBackupVM: BackupVm[] = []

  listName: string[]
  constructor(
    private backupVmService: BackupVmService,
    private instanceService: InstancesService,
    private route: ActivatedRoute,
    private fb: NonNullableFormBuilder,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService,
    private router: Router
  ) {
  }

  ngOnChanges(changes): void {
    if (changes.project) {
      this.validateForm.controls.projectId.setValue(changes.project)
    }

  }

  goBack(): void {
    this.router.navigate(['/app-smart-cloud/backup-vm'])
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id

    this.loadData()
  }

  // handleInstanceOfferChange(value: number) {
  //     this.validateForm.controls.backupInstanceOfferId.setValue(value)
  // }

  getParam(): BackupVMFormSearch {
    this.formSearch.regionId = this.region

    this.formSearch.customerId = this.tokenService.get()?.userId
    this.formSearch.projectId = this.project

    this.formSearch.instanceBackupName = null

    return this.formSearch
  }

  validateDuplicateName(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.listName && this.listName.includes(value)) {
      return {duplicateName: true}; // Duplicate name found
    } else {
      return null;
    }

  }

  search() {
    this.backupVmService.search(this.formSearch).subscribe(data => {
      this.listBackupVM = data.records
      this.listBackupVM.forEach(item => {
        if(this.listName?.length > 0) {
          this.listName.push(item.name)
        } else {
          this.listName = [item.name]
        }
      })
    })
  }

  submitForm(): void {
    this.isLoading = true
    if (this.validateForm.valid) {
      console.log(this.validateForm.getRawValue());
      this.formCreateBackup = Object.assign(this.validateForm.value)
      this.formSearch = this.getParam()


      let createBackupVmSpecification = new CreateBackupVmSpecification();
      createBackupVmSpecification.instanceId = this.formCreateBackup.instanceId;
      createBackupVmSpecification.backupInstanceOfferId = 73; // dùng để tính giá về sau
      createBackupVmSpecification.volumeToBackupIds = this.formCreateBackup.volumeToBackupIds;
      createBackupVmSpecification.securityGroupToBackupIds = this.formCreateBackup.securityGroupToBackupIds;
      createBackupVmSpecification.description = this.formCreateBackup.description;
      createBackupVmSpecification.backupPackageId = this.formCreateBackup.backupPacketId;
      createBackupVmSpecification.customerId = this.formCreateBackup.customerId;
      createBackupVmSpecification.serviceName = this.formCreateBackup.backupName;
      createBackupVmSpecification.regionId = this.region;
      createBackupVmSpecification.serviceType = 9; // 9 là backup_vm

      console.log(createBackupVmSpecification);

      let createBackupVmOrderData = new CreateBackupVmOrderData();
      createBackupVmOrderData.customerId = this.tokenService.get()?.userId;
      createBackupVmOrderData.createdByUserId = this.formCreateBackup.customerId;
      createBackupVmOrderData.note = 'tạo backup máy ảo';
      createBackupVmOrderData.orderItems = [
        {
          orderItemQuantity: 1,
          specification: JSON.stringify(createBackupVmSpecification),
          specificationType: 'instancebackup_create',
          price: 0,
          serviceDuration: 1
        }
      ]
      console.log(createBackupVmOrderData);

      this.backupVmService.create(createBackupVmOrderData).subscribe(data => {
        this.isLoading = false
        console.log('data create', data)
        this.notification.success('Thành công', 'Yêu cầu tạo backup máy ảo đã được gửi đi')
        this.router.navigate(['/app-smart-cloud/backup-vm'])
      })

    } else {
      this.isLoading = false;
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({onlySelf: true});
        }
      });
    }
  }

  ngOnInit(): void {
    this.customerId = this.tokenService.get()?.userId
    this.formSearch.customerId = this.tokenService.get()?.userId
    this.formSearch.pageSize = 1000
    this.formSearch.currentPage = 1
    this.loadData()
    this.search()
  }

  loadData() {

    this.route.params.subscribe((params) => {
      const selectedInstanceId = params['id']
      console.log('receive: ', selectedInstanceId)
      if (selectedInstanceId !== undefined) {
        if (this.project) {
          this.validateForm.controls.projectId.setValue(this.project)
        }
        this.validateForm.controls.backupInstanceOfferId.setValue(73)
        this.validateForm.controls.scheduleId.setValue(0)
        this.validateForm.controls.customerId.setValue(this.customerId)
        if (selectedInstanceId) {
          this.validateForm.controls.instanceId.setValue(parseInt(selectedInstanceId))
          this.getSecurityGroup(parseInt(selectedInstanceId))

          this.getBackupPackage()
        }
      }
    })

  }

  //id: id của máy ảo
  getVolumeInstanceAttachment(id: number) {
    this.backupVmService.getVolumeInstanceAttachment(id).subscribe(data => {
      this.volumeAttachments = data
      console.log('volume attach', this.volumeAttachments)
    })
  }

  getBackupPackage() {
    this.backupVmService.getBackupPackages(this.customerId).subscribe(data => {
      this.backupPackages = data
      console.log('backup package', this.backupPackages)
    })
  }

  getSecurityGroup(selectedInstanceId: number) {
    this.instanceService.getInstanceById(selectedInstanceId).subscribe(data => {
      this.instance = data;
      this.isLoading = false
      this.instanceService.getAllSecurityGroupByInstance(
        this.instance.cloudId,
        this.instance.regionId,
        this.instance.customerId,
        this.instance.projectId
      ).subscribe(data => {
        this.securityGroups = data
        console.log('sg', this.securityGroups)
      })
      this.getVolumeInstanceAttachment(this.instance.id)
    })
  }

}
