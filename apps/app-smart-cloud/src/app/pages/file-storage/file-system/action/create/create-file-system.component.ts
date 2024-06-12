import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { SnapshotVolumeService } from '../../../../../shared/services/snapshot-volume.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import {
  CreateFileSystemRequestModel,
  FormSearchFileSystem,
  OrderCreateFileSystem
} from '../../../../../shared/models/file-system.model';
import { FileSystemService } from '../../../../../shared/services/file-system.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectModel, RegionModel, storageValidator } from '../../../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { FileSystemSnapshotService } from 'src/app/shared/services/filesystem-snapshot.service';
import { FormSearchFileSystemSnapshot } from 'src/app/shared/models/filesystem-snapshot';
import { ProjectService } from 'src/app/shared/services/project.service';
import { debounceTime, Subject } from 'rxjs';
import { ConfigurationsService } from '../../../../../shared/services/configurations.service';

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
    storage: [0, [Validators.required, Validators.pattern(/^[0-9]*$/), this.checkQuota.bind(this)]],
    checked: [false],
    description: [''],
    snapshot: [null as number, []],
    isSnapshot: [false]
  });

  optionProtocols = [
    { value: 'NFS', label: 'NFS' },
    { value: 'CIFS', label: 'CIFS' },
    { value: 'SMB', label: 'SMB' }
  ];

  isVisibleConfirm: boolean = false;
  isLoading: boolean = true;

  storage: number = 0;

  snapshotList = [];

  snapshotSelected: number;

  formCreate: OrderCreateFileSystem = new OrderCreateFileSystem();

  nameList: string[] = [];

  storageBuyVpc: number;
  storageUsed: number;
  storageRemaining: number;

  isInitSnapshot = false;

  dataSubjectStorage: Subject<any> = new Subject<any>();
  minStorage: number = 0;
  stepStorage: number = 0;
  valueStringConfiguration: string = '';
  maxStorage: number = 0;

  idSnapshot: number;

  snapshotCloudId: string;

  snapshot: any;

  constructor(private fb: NonNullableFormBuilder,
              private snapshotvlService: SnapshotVolumeService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private fileSystemService: FileSystemService,
              private notification: NzNotificationService,
              private router: Router,
              private projectService: ProjectService,
              private fileSystemSnapshotService: FileSystemSnapshotService,
              private activatedRoute: ActivatedRoute,
              private renderer: Renderer2,
              private configurationsService: ConfigurationsService) {
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

  checkQuota(control) {
    const value = control.value;
    if (this.storageRemaining < value) {
      return { notEnough: true };
    } else if (this.storageRemaining == 0) {
      return { outOfStorage: true };
    } else {
      return null;
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
    this.isInitSnapshot = value;
    if (this.isInitSnapshot) {
      this.validateForm.controls.snapshot.setValidators(Validators.required);
    } else {
      this.validateForm.controls.snapshot.clearValidators();
      this.validateForm.controls.snapshot.updateValueAndValidity();

      this.validateForm.controls.storage.clearValidators();
      this.validateForm.controls.storage.updateValueAndValidity();
    }
  }

  onSnapshotChangeSelected(value) {
    this.snapshotSelected = value;
    console.log('selected', this.snapshotSelected);
    if (this.snapshotSelected != null) {
      this.getDetailFileSystemSnapshot(this.snapshotSelected);
      // this.validateForm.controls.storage.setValue(this.fileSystemSnapshotDetail?.)
    }

  }

  getListSnapshot() {
    let formSearchFileSystemSnapshot: FormSearchFileSystemSnapshot = new FormSearchFileSystemSnapshot();
    formSearchFileSystemSnapshot.vpcId = this.project;
    formSearchFileSystemSnapshot.regionId = this.region;
    formSearchFileSystemSnapshot.isCheckState = true;
    formSearchFileSystemSnapshot.pageSize = 9999;
    formSearchFileSystemSnapshot.currentPage = 1;
    formSearchFileSystemSnapshot.customerId = this.tokenService.get()?.userId;
    this.fileSystemSnapshotService.getFileSystemSnapshot(formSearchFileSystemSnapshot).subscribe(data => {
      data.records.forEach(snapshot => {
        if (['available', 'KHOITAO'].includes(snapshot.status)) {
          this.snapshotList.push(snapshot);
        }
      });
      if (this.activatedRoute.snapshot.paramMap.get('snapshotId') != undefined) {
        const idSnapshot = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('snapshotId'));
        console.log('listSnapshot: ', this.snapshotList);
        if (this.snapshotList?.find(x => x.id == idSnapshot)) {
          this.snapshotSelectedChange(true);
          this.snapshotSelected = idSnapshot;
          this.validateForm.controls.snapshot.setValue(this.snapshotSelected);
          this.getDetailFileSystemSnapshot(idSnapshot);
        }
      }
    });
  }

  getDetailFileSystemSnapshot(id) {
    this.fileSystemSnapshotService.getFileSystemSnapshotById(id, this.project).subscribe(data => {
      this.snapshot = data;
      // console.log('data', data.cloudId);
      this.snapshotCloudId = data.cloudId;
      // this.minStorage = data.sizeInGB
      this.validateForm.controls.storage.setValue(data.sizeInGB);
      this.validateForm.controls.storage.setValidators([storageValidator(data.sizeInGB)]);
      this.validateForm.controls.storage.updateValueAndValidity();
    });

  }

  getListFileSystem() {
    this.isLoading = true;
    let formSearch = new FormSearchFileSystem();
    formSearch.vpcId = this.project;
    formSearch.regionId = this.region;
    formSearch.name = null;
    formSearch.currentPage = 1;
    formSearch.pageSize = 9999;
    formSearch.isCheckState = true;
    this.fileSystemService.search(formSearch).subscribe(data => {
      this.isLoading = false;
      data?.records?.forEach(item => {
        this.nameList?.push(item?.name);
      });
      console.log(this.nameList);
    });
  }

  initFileSystem() {
    this.formCreate.projectCloudId = null;
    this.formCreate.shareProtocol = this.validateForm.controls.protocol.value;
    this.formCreate.size = this.storage;
    this.formCreate.name = this.validateForm.controls.name.value.trimStart().trimEnd();
    this.formCreate.description = this.validateForm.controls.description.value;
    this.formCreate.displayName = this.validateForm.controls.name.value;
    this.formCreate.displayDescription = this.validateForm.controls.description.value;
    console.log('share type', this.validateForm.controls.type.value);
    if (this.validateForm.controls.type.value == 1) {
      this.formCreate.shareType = 'generic_share_type';
    }
    if (this.validateForm.controls.snapshot.value != null) {
      this.formCreate.snapshotId = this.validateForm.controls.snapshot.value;
    }
    if (this.snapshotCloudId != undefined) {
      this.formCreate.snapshotCloudId = this.snapshotCloudId;
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
    this.isLoading = true;
    this.projectService.getProjectVpc(this.project).subscribe(data => {
      this.storageBuyVpc = data.cloudProject?.quotaShareInGb;
      this.storageUsed = data.cloudProjectResourceUsed?.quotaShareInGb;
      this.storageRemaining = this.storageBuyVpc - data.cloudProjectResourceUsed?.quotaShareInGb;
      console.log('share remaining', this.storageRemaining);
      this.validateForm.controls.storage.markAsDirty();
      this.validateForm.controls.storage.updateValueAndValidity();
      this.isLoading = false;
    });
  }

  doCreateFileSystem() {
    this.isLoading = true;
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
          this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.file.system.notification.require.create.success'));
          this.router.navigate(['/app-smart-cloud/file-storage/file-system/list']);
        }
      } else {
        this.isLoading = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.file.system.notification.require.create.fail'));
      }
    }, error => {
      this.isLoading = false;
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.file.system.notification.require.create.fail'));
    });

  }

  showModalConfirm() {
    this.isVisibleConfirm = true;
  }

  handleCancel() {
    this.isVisibleConfirm = false;
    this.isLoading = false;
  }

  handleOk() {
    // this.isLoading = true;
    this.submitForm();
  }

  storageSelectedChange(value) {
    this.dataSubjectStorage.next(value);
  }

  onChangeStorage() {
    this.dataSubjectStorage.pipe(debounceTime(500))
      .subscribe((res) => {
        if (res % this.stepStorage > 0) {
          this.notification.warning('', this.i18n.fanyi('app.notify.amount.capacity', { number: this.stepStorage }));
          this.storage = res - (res % this.stepStorage);
        }

      });
  }

  getConfigurations() {
    this.configurationsService.getConfigurations('BLOCKSTORAGE').subscribe(data => {
      this.valueStringConfiguration = data.valueString;
      const arr = this.valueStringConfiguration.split('#');
      this.minStorage = Number.parseInt(arr[0]);
      this.stepStorage = Number.parseInt(arr[1]);
      this.maxStorage = Number.parseInt(arr[2]);
    });
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.validateForm.controls.type.setValue(1);

    if (this.activatedRoute.snapshot.paramMap.get('snapshotId') != undefined || this.activatedRoute.snapshot.paramMap.get('snapshotId') != null) {
      console.log('here');
      this.idSnapshot = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('snapshotId'));
      this.validateForm.controls.isSnapshot.setValue(true);
      this.validateForm.controls.snapshot.setValue(this.idSnapshot);
    }
    this.getListSnapshot();
    this.getListFileSystem();
    this.getStorageBuyVpc();
    this.onChangeStorage();
    this.getConfigurations();
  }
}
