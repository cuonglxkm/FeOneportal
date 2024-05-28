import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { FormSearchFileSystem, OrderCreateFileSystem } from '../../../../shared/models/file-system.model';
import { SnapshotVolumeService } from '../../../../shared/services/snapshot-volume.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { FileSystemService } from '../../../../shared/services/file-system.service';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { DataPayment, ItemPayment } from '../../../instances/instances.model';
import { debounceTime, Subject } from 'rxjs';
import { InstancesService } from '../../../instances/instances.service';
import { OrderItem } from '../../../../shared/models/price';
import { CreateVolumeRequestModel } from '../../../../shared/models/volume.model';
import { ProjectModel, RegionModel } from '../../../../../../../../libs/common-utils/src';
import { FormSearchFileSystemSnapshot } from 'src/app/shared/models/filesystem-snapshot';
import { FileSystemSnapshotService } from 'src/app/shared/services/filesystem-snapshot.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

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
    storage: [0, [Validators.required,Validators.pattern(/^[0-9]*$/)]],
    checked: [false],
    description: [''],
    snapshot: [null as number, []],
    isSnapshot: [false],
    time: [1]
  });

  optionProtocols = [
    { value: 'NFS', label: 'NFS' },
    { value: 'CIFS', label: 'CIFS' },
    { value: 'SMB', label: 'SMB'}
  ];

  isVisibleConfirm: boolean = false;
  isLoading: boolean = false;

  snapshotList: NzSelectOptionInterface[] = [];

  snapshotSelected: number;

  formCreate: OrderCreateFileSystem = new OrderCreateFileSystem();

  nameList: string[] = [];
  isInitSnapshot: boolean = false;

  timeSelected: any;

  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;

  dataSubjectStorage: Subject<any> = new Subject<any>();
  dataSubjectTime: Subject<any> = new Subject<any>();

  constructor(private fb: NonNullableFormBuilder,
              private snapshotvlService: SnapshotVolumeService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private fileSystemService: FileSystemService,
              private router: Router,
              private instanceService: InstancesService,
              private fileSystemSnapshotService: FileSystemSnapshotService,
              private activatedRoute: ActivatedRoute,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
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
    console.log('switch', value);
    this.isInitSnapshot = value;
    if (this.isInitSnapshot) {
      this.validateForm.controls.snapshot.setValidators(Validators.required);
    } else {
      this.validateForm.controls.snapshot.clearValidators();
      this.validateForm.controls.snapshot.updateValueAndValidity();
    }
  }


  onChangeTime() {
    this.dataSubjectTime.pipe(debounceTime(500))
      .subscribe((res) => {
        console.log('total amount');
        this.getTotalAmount();
      });
  }

  onChangeStorage() {
    this.dataSubjectStorage.pipe(debounceTime(500))
      .subscribe((res) => {
        if (res % 10 > 0) {
          this.notification.warning('', this.i18n.fanyi('app.notify.amount.capacity'));
          this.validateForm.controls.storage.setValue(res - (res % 10))
        }
        console.log('total amount');
        this.getTotalAmount();
      });
  }

  timeSelectedChange(value) {
    this.dataSubjectTime.next(value);
  }

  storageSelectedChange(value) {
    this.dataSubjectStorage.next(value);
  }

  getListSnapshot() {
    let formSearchFileSystemSnapshot: FormSearchFileSystemSnapshot = new FormSearchFileSystemSnapshot();
    formSearchFileSystemSnapshot.vpcId = this.project
    formSearchFileSystemSnapshot.regionId = this.region
    formSearchFileSystemSnapshot.isCheckState = false
    formSearchFileSystemSnapshot.pageSize = 9999;
    formSearchFileSystemSnapshot.currentPage = 1;
    formSearchFileSystemSnapshot.customerId = this.tokenService.get()?.userId
    this.fileSystemSnapshotService.getFileSystemSnapshot(formSearchFileSystemSnapshot).subscribe(data => {
      data.records.forEach(snapshot => {
        this.snapshotList.push({ label: snapshot.name, value: snapshot.id });
      });
      if(this.activatedRoute.snapshot.paramMap.get('snapshotId')){
        const idSnapshot = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('snapshotId'));
        if(this.snapshotList.find(x => x.value == idSnapshot)) {
          this.snapshotSelectedChange(true);
          this.snapshotSelected = idSnapshot;
        }
      }
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
    this.formCreate.projectId = null;
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
        console.log('thanh tien file system', result.data);
        this.orderItem = result.data;
        this.unitPrice = this.orderItem?.orderItemPrices[0]?.unitPrice.amount;
      });
  }

  navigateToPayment() {
    this.fileSystemInit();
    let request: CreateVolumeRequestModel = new CreateVolumeRequestModel();
    request.customerId = this.formCreate.customerId;
    request.createdByUserId = this.formCreate.customerId;
    request.note = 'tạo file system';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.formCreate),
        specificationType: 'filestorage_create',
        price: this.orderItem?.totalAmount.amount,
        serviceDuration: this.validateForm.controls.time.value
      }
    ];
    var returnPath: string = '/app-smart-cloud/file-storage/file-system/create/normal';
    console.log('request', request);
    console.log('service name', this.formCreate.serviceName);
    this.router.navigate(['/app-smart-cloud/order/cart'], {
      state: { data: request, path: returnPath }
    });
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    console.log('normal');
    this.project = regionAndProject.projectId;

    this.getListSnapshot();
    this.getListFileSystem();
    this.onChangeStorage();
    this.onChangeTime();
    this.getTotalAmount();
  }
}
