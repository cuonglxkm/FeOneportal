import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {
  CreateFileSystemRequestModel,
  FormSearchFileSystem,
  OrderCreateFileSystem
} from '../../../../shared/models/file-system.model';
import { SnapshotVolumeService } from '../../../../shared/services/snapshot-volume.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { FileSystemService } from '../../../../shared/services/file-system.service';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { DataPayment, ItemPayment } from '../../../instances/instances.model';
import { debounceTime, Subject } from 'rxjs';
import { InstancesService } from '../../../instances/instances.service';
import { OrderItem } from '../../../../shared/models/price';
import {
  AppValidator,
  ProjectModel,
  RegionModel,
  storageValidator
} from '../../../../../../../../libs/common-utils/src';
import { FormSearchFileSystemSnapshot } from 'src/app/shared/models/filesystem-snapshot';
import { FileSystemSnapshotService } from 'src/app/shared/services/filesystem-snapshot.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { ConfigurationsService } from '../../../../shared/services/configurations.service';
import { OrderService } from '../../../../shared/services/order.service';



@Component({
  selector: 'one-portal-create-file-system-normal',
  templateUrl: './create-file-system-normal.component.html',
  styleUrls: ['./create-file-system-normal.component.less']
})
export class CreateFileSystemNormalComponent implements OnInit {
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
    time: FormControl<number>
  }> = this.fb.group({
    name: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9-_ ]+$/),
      this.duplicateNameValidator.bind(this)]],
    protocol: ['NFS', [Validators.required]],
    type: [1, [Validators.required]],
    storage: [0, [Validators.required, Validators.pattern(/^[0-9]*$/)]],
    checked: [false],
    description: [''],
    snapshot: [null as number, []],
    isSnapshot: [false],
    time: [1]
  });

  optionProtocols = [
    { value: 'NFS', label: 'NFS' },
    { value: 'CIFS', label: 'CIFS' },
    { value: 'SMB', label: 'SMB' }
  ];

  isLoading: boolean = false;
  isLoadingAction: boolean = false;

  snapshotList = [];

  snapshotSelected: number;

  formCreate: OrderCreateFileSystem = new OrderCreateFileSystem();

  nameList: string[] = [];
  isInitSnapshot: boolean = false;

  timeSelected: any;

  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;

  dataSubjectStorage: Subject<any> = new Subject<any>();
  dataSubjectTime: Subject<any> = new Subject<any>();

  minStorage: number = 0;
  stepStorage: number = 0;
  valueStringConfiguration: string = '';
  maxStorage: number = 0;

  sizeSnapshot: number;

  snapshotCloudId: string;

  snapshot: any;

  constructor(private fb: NonNullableFormBuilder,
              private snapshotvlService: SnapshotVolumeService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private fileSystemService: FileSystemService,
              private router: Router,
              private instanceService: InstancesService,
              private fileSystemSnapshotService: FileSystemSnapshotService,
              private activatedRoute: ActivatedRoute,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private configurationsService: ConfigurationsService,
              private orderService: OrderService) {
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

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/list']);
  }

  snapshotSelectedChange(value) {
    console.log('switch', value);
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


  onChangeTime(value) {
    this.timeSelected = value;
    this.validateForm.controls.time.setValue(this.timeSelected);
    console.log(this.timeSelected);
    this.getTotalAmount();
  }

  onChangeStorage() {
    this.dataSubjectStorage.pipe(debounceTime(500))
      .subscribe((res) => {
        if (res % this.stepStorage > 0) {
          this.notification.warning('', this.i18n.fanyi('app.notify.amount.capacity', { number: this.stepStorage }));
          this.validateForm.controls.storage.setValue(res - (res % this.stepStorage));
        }
        console.log('total amount');
        this.getTotalAmount();
      });
  }

  storageSelectedChange(value) {
    this.dataSubjectStorage.next(value);
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
          this.snapshotList?.push(snapshot);
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
      this.getTotalAmount();
    });
  }

  getDetailFileSystemSnapshot(id) {
    this.fileSystemSnapshotService.getFileSystemSnapshotById(id, this.project).subscribe(data => {
      // console.log('data', data.cloudId);
      this.snapshot = data;
      this.snapshotCloudId = data.cloudId;
      // this.minStorage = data.sizeInGB;
      this.validateForm.controls.storage.setValue(data.sizeInGB);
      this.validateForm.controls.storage.setValidators([storageValidator(data.sizeInGB)]);
      this.validateForm.controls.storage.updateValueAndValidity();
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

  fileSystemInit() {
    this.formCreate.projectCloudId = null;
    this.formCreate.shareProtocol = this.validateForm.controls.protocol.value;
    this.formCreate.size = this.validateForm.controls.storage.value;
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
    this.formCreate.serviceName = this.validateForm.controls.name.value;
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

  getTotalAmount() {
    this.isLoadingAction = true;
    this.fileSystemInit();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.formCreate);
    itemPayment.specificationType = 'filestorage_create';
    itemPayment.serviceDuration = this.validateForm.get('time').value;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.instanceService.getTotalAmount(dataPayment)
      .pipe(debounceTime(500))
      .subscribe((result) => {
        this.isLoadingAction = false;
        console.log('thanh tien file system', result.data);
        this.orderItem = result.data;
        this.unitPrice = this.orderItem?.orderItemPrices[0]?.unitPrice.amount;
      });
  }

  isVisiblePopupError: boolean = false;
  errorList: string[] = [];

  closePopupError() {
    this.isVisiblePopupError = false;
  }

  navigateToPayment() {
    this.isLoadingAction = true;
    this.fileSystemInit();
    let request: CreateFileSystemRequestModel = new CreateFileSystemRequestModel();
    request.customerId = this.formCreate.customerId;
    request.createdByUserId = this.formCreate.customerId;
    request.note = 'tạo file system';
    request.totalPayment = this.orderItem?.totalPayment?.amount;
    request.totalVAT = this.orderItem?.totalVAT?.amount;
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.formCreate),
        specificationType: 'filestorage_create',
        price: this.orderItem?.totalAmount.amount,
        serviceDuration: this.validateForm.controls.time.value
      }
    ];
    this.orderService.validaterOrder(request).subscribe(data => {
      this.isLoadingAction = false;
      if (data.success) {
        var returnPath: string = '/app-smart-cloud/file-storage/file-system/create/normal';
        console.log('request', request);
        console.log('service name', this.formCreate.serviceName);
        this.router.navigate(['/app-smart-cloud/order/cart'], {
          state: { data: request, path: returnPath }
        });
      } else {
        this.isVisiblePopupError = true;
        this.errorList = data.data;
      }
    }, error => {
      this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.detail);
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

    this.getListSnapshot();

    this.getListFileSystem();
    this.onChangeStorage();
    this.getConfigurations();

  }
}
