import { Component, Inject, OnInit } from '@angular/core';
import { RegionModel } from '../../../../../shared/models/region.model';
import { ProjectModel } from '../../../../../shared/models/project.model';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { SnapshotVolumeService } from '../../../../../shared/services/snapshot-volume.service';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { CreateFileSystemRequestModel, OrderCreateFileSystem } from '../../../../../shared/models/file-system.model';
import { InstancesService } from '../../../../instances/instances.service';
import { FileSystemService } from '../../../../../shared/services/file-system.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';

@Component({
  selector: 'one-portal-create-file-system',
  templateUrl: './create-file-system.component.html',
  styleUrls: ['./create-file-system.component.less'],
})
export class CreateFileSystemComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  validateForm: FormGroup<{
    name: FormControl<string>
    protocol: FormControl<string>
    type: FormControl<number>
    storage: FormControl<number>
    checked: FormControl<boolean>
    description: FormControl<string>
    snapshot: FormControl<number>
  }> = this.fb.group({
    name: ['', [Validators.required]],
    protocol: ['NFS', [Validators.required]],
    type: [1, [Validators.required]],
    storage: [1, [Validators.required]],
    checked: [false],
    description: [''],
    snapshot: [null as number, []]
  });

  name: string = ''
  type: string = '1'
  protocol: string = 'NFS'
  storage: number = 1

  optionProtocols = [
    {value: 'NFS', label: 'NFS'},
    {value: 'CIFS', label: 'CIFS'}
  ]

  isVisibleConfirm: boolean = false
  isLoading: boolean = false

  snapshotList: NzSelectOptionInterface[] = [];

  snapshotSelected: any

  formCreate: OrderCreateFileSystem = new OrderCreateFileSystem()

  constructor(private fb: NonNullableFormBuilder,
              private snapshotvlService: SnapshotVolumeService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private fileSystemService: FileSystemService,
              private notification: NzNotificationService,
              private router: Router) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  snapshotSelectedChange(value) {
    this.snapshotSelected = value
  }

  getListSnapshot() {
    this.snapshotvlService.getSnapshotVolumes(9999, 1, this.region, this.project, '', '', '').subscribe(data => {
      data.records.forEach(snapshot => {
        this.snapshotList.push({label: snapshot.name, value: snapshot.id});
      })
    });
  }

  initFileSystem() {
    this.formCreate.projectId = null
    this.formCreate.shareProtocol = this.validateForm.controls.protocol.value
    this.formCreate.size = this.validateForm.controls.storage.value
    this.formCreate.name = this.validateForm.controls.name.value
    this.formCreate.description = this.validateForm.controls.description.value
    this.formCreate.displayName = this.validateForm.controls.name.value
    this.formCreate.displayDescription = this.validateForm.controls.description.value
    console.log('share type', this.validateForm.controls.type.value)
    if(this.validateForm.controls.type.value == 1) {
      this.formCreate.shareType = 'generic_share_type'
    }
    if(this.validateForm.controls.snapshot.value == null) {
      this.formCreate.snapshotId = null
    } else {
      this.formCreate.snapshotId = this.validateForm.controls.snapshot.value.toString()
    }
    this.formCreate.isPublic = false
    this.formCreate.shareGroupId = null
    this.formCreate.metadata = null
    this.formCreate.shareNetworkId = null
    this.formCreate.availabilityZone = null
    this.formCreate.schedulerHints = null
    this.formCreate.actorId = 0
    this.formCreate.serviceInstanceId = 0
    this.formCreate.vpcId = this.project
    this.formCreate.customerId = this.tokenService.get()?.userId
    this.formCreate.userEmail = this.tokenService.get()?.email
    this.formCreate.actorEmail = this.tokenService.get()?.email
    this.formCreate.regionId = this.region
    this.formCreate.serviceName = null
    this.formCreate.serviceType = 18
    this.formCreate.actionType = 0
    this.formCreate.serviceInstanceId = 0
    this.formCreate.createDate = new Date().toISOString().substring(0, 19)
    this.formCreate.expireDate = new Date().toISOString().substring(0, 19)
    this.formCreate.createDateInContract = null
    this.formCreate.saleDept = null
    this.formCreate. saleDeptCode = null
    this.formCreate.contactPersonEmail = null
    this.formCreate.contactPersonPhone = null
    this.formCreate.contactPersonName = null
    this.formCreate.am = null
    this.formCreate.amManager = null
    this.formCreate.note = 'filestorage-create'
    this.formCreate.isTrial = false
    this.formCreate.offerId = 0
    this.formCreate.couponCode = null
    this.formCreate.dhsxkd_SubscriptionId = null
    this.formCreate.dSubscriptionNumber = null
    this.formCreate.dSubscriptionType = null
    this.formCreate.oneSMEAddonId = null
    this.formCreate.oneSME_SubscriptionId = null
    this.formCreate.typeName = "SharedKernel.IntegrationEvents.Orders.Specifications.ShareCreateSpecificationSharedKernel.IntegrationEvents Version=1.0.0.0 Culture=neutral PublicKeyToken=null"
  }

  submitForm() {
    if(this.validateForm.valid){
      this.initFileSystem()
      console.log('data', this.formCreate)
      this.doCreateFileSystem()
    }
  }

  doCreateFileSystem() {
    let request = new CreateFileSystemRequestModel()
    request.customerId = this.formCreate.customerId;
    request.createdByUserId = this.formCreate.customerId;
    request.note = 'Tạo File System';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.formCreate),
        specificationType: 'filestorage_create',
        price: 0,
        serviceDuration: 1
      }
    ]

    console.log('request', request)

    this.fileSystemService.create(request).subscribe(data => {
      if (data != null) {
        if(data.code == 200){
          this.isLoading = false;
          this.notification.success('Thành công', 'Yêu cầu tạo File Storage thành công.')
          this.router.navigate(['/app-smart-cloud/file-storage/file-system/list']);
        }
      }else{
        this.isLoading = false;
        this.notification.error('Thất bại', 'Yêu cầu tạo File Storage thất bại.')
      }
    }, error => {
      this.isLoading = false;
      this.notification.error('Thất bại', 'Yêu cầu tạo File Storage thất bại.')
    })

  }

  showModalConfirm() {
    this.isVisibleConfirm = true
    this.initFileSystem()
    this.name = this.formCreate.name

  }

  handleCancel() {
    this.isVisibleConfirm = false
    this.isLoading = false
  }

  handleOk() {
    this.submitForm()
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.getListSnapshot()
  }
}
