import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { SnapshotVolumeService } from '../../../../../shared/services/snapshot-volume.service';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import {
  CreateFileSystemRequestModel,
  FormSearchFileSystem,
  OrderCreateFileSystem
} from '../../../../../shared/models/file-system.model';
import { FileSystemService } from '../../../../../shared/services/file-system.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import { ProjectService, RegionModel, ProjectModel } from '../../../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-create-file-system',
  templateUrl: './create-file-system.component.html',
  styleUrls: ['./create-file-system.component.less']
})
export class CreateFileSystemComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  validateForm: FormGroup<{
    name: FormControl<string>
    protocol: FormControl<string>
    type: FormControl<number>
    storage: FormControl<number>
    checked: FormControl<boolean>
    description: FormControl<string>
    snapshot: FormControl<number>
    isSnapshot: FormControl<boolean>
  }> = this.fb.group({
    name: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9-_ ]+$/),
      this.duplicateNameValidator.bind(this)]],
    protocol: ['NFS', [Validators.required]],
    type: [1, [Validators.required]],
    storage: [1, [Validators.required]],
    checked: [false],
    description: [''],
    snapshot: [null as number, []],
    isSnapshot:[false]
  });

  optionProtocols = [
    { value: 'NFS', label: 'NFS' },
    { value: 'CIFS', label: 'CIFS' }
  ];

  isVisibleConfirm: boolean = false;
  isLoading: boolean = false;

  snapshotList: NzSelectOptionInterface[] = [];

  snapshotSelected: any;

  formCreate: OrderCreateFileSystem = new OrderCreateFileSystem();

  nameList: string[] = [];

  storageBuyVpc: number;

  isInitSnapshot = false;

  constructor(private fb: NonNullableFormBuilder,
              private snapshotvlService: SnapshotVolumeService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private fileSystemService: FileSystemService,
              private notification: NzNotificationService,
              private router: Router,
              private projectService: ProjectService) {
  }

  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null; // Name is unique
    }
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/list']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/list']);
  }

  snapshotSelectedChange(value) {
    this.isInitSnapshot = value
    if (this.isInitSnapshot) {
      this.validateForm.controls.snapshot.setValidators(Validators.required);
    } else {
      this.validateForm.controls.snapshot.clearValidators();
      this.validateForm.controls.snapshot.updateValueAndValidity();
    }
  }

  getListSnapshot() {
    this.snapshotvlService.getSnapshotVolumes(9999, 1, this.region, this.project, '', '', '').subscribe(data => {
      data.records.forEach(snapshot => {
        this.snapshotList.push({ label: snapshot.name, value: snapshot.id });
      });
    });
  }

  getListFileSystem() {
    let formSearch = new FormSearchFileSystem();
    formSearch.vpcId = this.project;
    formSearch.regionId = this.region;
    formSearch.name = null;
    formSearch.currentPage = 1;
    formSearch.pageSize = 9999;
    formSearch.isCheckState = true;
    this.fileSystemService.search(formSearch).subscribe(data => {
      data?.records?.forEach(item => {
        this.nameList?.push(item?.name);
      });
      console.log(this.nameList);
    });
  }

  initFileSystem() {
    this.formCreate.projectId = null;
    this.formCreate.shareProtocol = this.validateForm.controls.protocol.value;
    this.formCreate.size = this.validateForm.controls.storage.value;
    this.formCreate.name = this.validateForm.controls.name.value;
    this.formCreate.description = this.validateForm.controls.description.value;
    this.formCreate.displayName = this.validateForm.controls.name.value;
    this.formCreate.displayDescription = this.validateForm.controls.description.value;
    console.log('share type', this.validateForm.controls.type.value);
    if (this.validateForm.controls.type.value == 1) {
      this.formCreate.shareType = 'generic_share_type';
    }
    if (this.validateForm.controls.snapshot.value == null) {
      this.formCreate.snapshotId = null;
    } else {
      this.formCreate.snapshotId = this.validateForm.controls.snapshot.value.toString();
    }
    this.formCreate.isPublic = false;
    this.formCreate.shareGroupId = null;
    this.formCreate.metadata = null;
    this.formCreate.shareNetworkId = null;
    this.formCreate.availabilityZone = null;
    this.formCreate.schedulerHints = null;
    this.formCreate.actorId = 0;
    this.formCreate.serviceInstanceId = 0;
    this.formCreate.vpcId = this.project;
    this.formCreate.customerId = this.tokenService.get()?.userId;
    this.formCreate.userEmail = this.tokenService.get()?.email;
    this.formCreate.actorEmail = this.tokenService.get()?.email;
    this.formCreate.regionId = this.region;
    this.formCreate.serviceName = null;
    this.formCreate.serviceType = 18;
    this.formCreate.actionType = 0;
    this.formCreate.serviceInstanceId = 0;
    this.formCreate.createDate = new Date().toISOString().substring(0, 19);
    this.formCreate.expireDate = new Date().toISOString().substring(0, 19);
    this.formCreate.createDateInContract = null;
    this.formCreate.saleDept = null;
    this.formCreate.saleDeptCode = null;
    this.formCreate.contactPersonEmail = null;
    this.formCreate.contactPersonPhone = null;
    this.formCreate.contactPersonName = null;
    this.formCreate.am = null;
    this.formCreate.amManager = null;
    this.formCreate.note = 'filestorage-create';
    this.formCreate.isTrial = false;
    this.formCreate.offerId = 0;
    this.formCreate.couponCode = null;
    this.formCreate.dhsxkd_SubscriptionId = null;
    this.formCreate.dSubscriptionNumber = null;
    this.formCreate.dSubscriptionType = null;
    this.formCreate.oneSMEAddonId = null;
    this.formCreate.oneSME_SubscriptionId = null;
    this.formCreate.typeName = 'SharedKernel.IntegrationEvents.Orders.Specifications.ShareCreateSpecificationSharedKernel.IntegrationEvents Version=1.0.0.0 Culture=neutral PublicKeyToken=null';
  }

  submitForm() {
    if (this.validateForm.valid) {
      this.initFileSystem();
      console.log('data', this.formCreate);
      this.doCreateFileSystem();
    }
  }

  getStorageBuyVpc() {
    this.projectService.getProjectVpc(this.project).subscribe(data => {
      this.storageBuyVpc = data.cloudProject.quotaShareInGb
    })
  }

  doCreateFileSystem() {
    let request = new CreateFileSystemRequestModel();
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
    ];

    console.log('request', request);

    this.fileSystemService.create(request).subscribe(data => {
      if (data != null) {
        if (data.code == 200) {
          this.isLoading = false;
          this.notification.success(this.i18n.fanyi('app.status.success'), 'Yêu cầu tạo File Storage thành công.');
          this.router.navigate(['/app-smart-cloud/file-storage/file-system/list']);
        }
      } else {
        this.isLoading = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), 'Yêu cầu tạo File Storage thất bại.');
      }
    }, error => {
      this.isLoading = false;
      this.notification.error(this.i18n.fanyi('app.status.fail'), 'Yêu cầu tạo File Storage thất bại.');
    });

  }

  showModalConfirm() {
    this.isVisibleConfirm = true;
    this.initFileSystem();
  }

  handleCancel() {
    this.isVisibleConfirm = false;
    this.isLoading = false;
  }

  handleOk() {
    this.isLoading = true;
    this.submitForm();
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.getListSnapshot();
    this.getListFileSystem();
    this.getStorageBuyVpc();
  }
}
