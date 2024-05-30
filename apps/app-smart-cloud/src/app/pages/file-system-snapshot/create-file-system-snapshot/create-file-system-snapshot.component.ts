import { Component, Inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  FileSystemModel,
  FormSearchFileSystem,
} from 'src/app/shared/models/file-system.model';
import {
  FormCreateFileSystemSnapShot,
  OrderCreateFileSystemSnapshot,
} from 'src/app/shared/models/filesystem-snapshot';
import { FileSystemService } from 'src/app/shared/services/file-system.service';
import { FileSystemSnapshotService } from 'src/app/shared/services/filesystem-snapshot.service';
import {
  BaseResponse,
  ProjectModel,
  RegionModel,
} from '../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import {
  ServiceActionType,
  ServiceType,
} from 'src/app/shared/enums/common.enum';
import { DataPayment, ItemPayment } from '../../instances/instances.model';
import { InstancesService } from '../../instances/instances.service';
import { debounceTime, Subject } from 'rxjs';
import { OrderItem } from 'src/app/shared/models/price';
import { CreateVolumeRequestModel } from 'src/app/shared/models/volume.model';
import { addDays } from 'date-fns';
import { OrderService } from 'src/app/shared/services/order.service';
import { ConfigurationsService } from 'src/app/shared/services/configurations.service';

@Component({
  selector: 'one-portal-create-file-system-snapshot',
  templateUrl: './create-file-system-snapshot.component.html',
  styleUrls: ['./create-file-system-snapshot.component.less'],
})
export class CreateFileSystemSnapshotComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  value: string;
  pageSize: number = 9999;
  pageIndex: number = 1;
  response: BaseResponse<FileSystemModel[]>;
  listFileSystems: FileSystemModel[];
  isLoading: boolean = false;
  disableListFS: boolean = true;
  isCheckBegin: boolean = false;
  customerId: number;
  selectedFileSystemName: string;
  fileSysId: number;
  fileSysSize: number;
  typeVpc: number;
  dateString = new Date();
  expiredDate: Date = addDays(this.dateString, 30);
  isLoadingCreateFSS: boolean = false;
  valueStringConfiguration: string
  minStorage: number
  maxStorage: number
  stepStorage: number
  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;

  formCreateFileSystemSnapshot: FormCreateFileSystemSnapShot =
    new FormCreateFileSystemSnapShot();
  formCreate: OrderCreateFileSystemSnapshot =
    new OrderCreateFileSystemSnapshot();

  form: FormGroup<{
    nameFileSystem: FormControl<number>;
    nameSnapshot: FormControl<string>;
    description: FormControl<string>;
    time: FormControl<number>;
  }> = this.fb.group({
    nameFileSystem: [null as number, [Validators.required]],
    nameSnapshot: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(?! *$)[a-zA-Z0-9-_ ]{1,255}$/),
      ],
    ],
    description: [''],
    time: [1],
  });

  dataSubjectTime: Subject<any> = new Subject<any>();

  updateSelectedFileSystems(selectedFileSystem: number): void {
    const selectedOption = this.response.records.find(
      (option) => option.id === selectedFileSystem
    );
    if (selectedOption) {
      this.selectedFileSystemName = selectedOption.name;
    }
    this.fileSysId = selectedOption.id;
    this.fileSysSize = selectedOption.size;
    this.getTotalAmount();
  }

  getListFileSystem() {
    this.isLoading = true;
    let formSearch = new FormSearchFileSystem();
    formSearch.vpcId = this.project;
    formSearch.regionId = this.region;
    formSearch.name = this.value;
    formSearch.isCheckState = true;
    formSearch.pageSize = this.pageSize;
    formSearch.currentPage = this.pageIndex;

    this.fileSystemService
      .search(formSearch)

      .subscribe(
        (data) => {
          this.isLoading = false;
          this.disableListFS = false
          console.log('data file system', data);
          const filterData = data.records.filter(
            (x) => x.taskState == 'available'
          );
          this.listFileSystems = filterData;
          this.response = data;
          if (this.activatedRoute.snapshot.paramMap.get('fileSystemId')) {
            const fileSystemId = Number.parseInt(
              this.activatedRoute.snapshot.paramMap.get('fileSystemId')
            );
            if (this.response.records.find((x) => x.id == fileSystemId)) {
              this.fileSysId = fileSystemId;
            }
          }
        },
        (error) => {
          this.isLoading = false;
          this.disableListFS = false
          this.response = null;
        }
      );
  }

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.getListFileSystem();
    this.getConfigurations();
  }

  constructor(
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private fb: NonNullableFormBuilder,
    private fileSystemService: FileSystemService,
    private notification: NzNotificationService,
    private activatedRoute: ActivatedRoute,
    private instanceService: InstancesService,
    private orderService: OrderService,
    private configurationsService: ConfigurationsService
  ) {
    this.form.get('time').valueChanges.subscribe((data) => {
      this.getTotalAmount();
    });
  }

  caculator(event) {
    this.expiredDate = addDays(
      this.dateString,
      30 * this.form.get('time').value
    );
  }

  fileSystemSnapshotInit() {
    this.formCreate.serviceInstanceId = 0;
    this.formCreate.name = this.form.controls.nameSnapshot.value;
    this.formCreate.description = this.form.controls.description.value;
    this.formCreate.projectId = this.project;
    this.formCreate.force = false;
    this.formCreate.vpcId = this.project;
    this.formCreate.displayName = this.form.controls.nameSnapshot.value;
    this.formCreate.displayDescription = this.form.controls.description.value;
    this.formCreate.shareId = this.fileSysId;
    this.formCreate.customerId = this.tokenService.get()?.userId;
    this.formCreate.userEmail = this.tokenService.get()?.email;
    this.formCreate.actorEmail = this.tokenService.get()?.email;
    this.formCreate.regionId = this.region;
    this.formCreate.region = this.region;
    this.formCreate.serviceName = this.form.controls.nameSnapshot.value;
    this.formCreate.serviceType = ServiceType.SHARE_SNAPSHOT;
    this.formCreate.actionType = ServiceActionType.CREATE;
    this.formCreate.serviceInstanceId = 0;
    this.formCreate.createDate =
      this.typeVpc === 0 ? this.dateString : new Date();
    this.formCreate.expireDate =
      this.typeVpc === 0 ? this.expiredDate : new Date();
    this.formCreate.createDateInContract = null;
    this.formCreate.saleDept = null;
    this.formCreate.saleDeptCode = null;
    this.formCreate.contactPersonEmail = null;
    this.formCreate.contactPersonPhone = null;
    this.formCreate.contactPersonName = null;
    this.formCreate.am = null;
    this.formCreate.amManager = null;
    this.formCreate.note = 'fileshare-snapshot-create';
    this.formCreate.isTrial = false;
    this.formCreate.offerId = 0;
    this.formCreate.couponCode = null;
    this.formCreate.dhsxkd_SubscriptionId = null;
    this.formCreate.dSubscriptionNumber = null;
    this.formCreate.dSubscriptionType = null;
    this.formCreate.oneSMEAddonId = null;
    this.formCreate.oneSME_SubscriptionId = null;
    this.formCreate.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.ShareCreateSpecificationSharedKernel.IntegrationEvents Version=1.0.0.0 Culture=neutral PublicKeyToken=null';
  }

  getTotalAmount() {
    this.fileSystemSnapshotInit();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.formCreate);
    itemPayment.specificationType = 'sharesnapshot_create';
    itemPayment.serviceDuration = this.form.get('time').value;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.instanceService
      .getTotalAmount(dataPayment)
      .pipe(debounceTime(500))
      .subscribe((result) => {
        console.log('thanh tien file system', result.data);
        this.orderItem = result.data;
        this.unitPrice = this.orderItem?.orderItemPrices[0]?.unitPrice.amount;
      });
  }

  handleCreateFSS() {
    this.fileSystemSnapshotInit();
    let request: CreateVolumeRequestModel = new CreateVolumeRequestModel();
    request.customerId = this.formCreate.customerId;
    request.createdByUserId = this.formCreate.customerId;
    request.note = 'tạo file system snapshot';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.formCreate),
        specificationType: 'sharesnapshot_create',
        price: this.typeVpc === 0 ? this.orderItem?.totalAmount.amount : 0,
        serviceDuration: this.typeVpc === 0 ? 1 : this.form.controls.time.value,
      },
    ];
    if (this.typeVpc === 0) {
      this.orderService.validaterOrder(request).subscribe({
        next: (data) => {
          var returnPath: string =
            '/app-smart-cloud/file-system-snapshot/create';
          console.log('request', request);
          console.log('service name', this.formCreate.serviceName);
          this.router.navigate(['/app-smart-cloud/order/cart'], {
            state: { data: request, path: returnPath },
          });
        },
        error: (e) => {
          if(e.error.type === 'Exception'){
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.file.system.snapshot.create.size.fail'),
            );
          }else{
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              'Yêu cầu tạo File System Snapshot thất bại.'
            );
          }
        },
      });
    } else {
      this.isLoadingCreateFSS = true;
      this.orderService.validaterOrder(request).subscribe({
        next: (data) => {
          this.instanceService.create(request).subscribe(
            (data) => {
              if (data != null) {
                if (data.code == 200) {
                  this.isLoadingCreateFSS = false;
                  this.notification.success(
                    this.i18n.fanyi('app.status.success'),
                    'Yêu cầu tạo File System Snapshot thành công.'
                  );
                  this.router.navigate([
                    '/app-smart-cloud/file-system-snapshot/list',
                  ]);
                }
              } else {
                this.isLoadingCreateFSS = false;
                this.notification.error(
                  this.i18n.fanyi('app.status.fail'),
                  'Yêu cầu tạo File System Snapshot thất bại.'
                );
              }
            },
            (error) => {
              this.isLoadingCreateFSS = false;
              this.notification.error(
                this.i18n.fanyi('app.status.fail'),
                'Yêu cầu tạo File System Snapshot thất bại.'
              );
            }
          );
        },
        error: (e) => {
          this.isLoadingCreateFSS = false;
          if(e.error.type === 'Exception'){
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.file.system.snapshot.create.size.fail'),
            );
          }else{
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              'Yêu cầu tạo File System Snapshot thất bại.'
            );
          }
        },
      });
    }
  }

  getConfigurations() {
    this.configurationsService.getConfigurations('BLOCKSTORAGE').subscribe(data => {
      this.valueStringConfiguration = data.valueString;
      const arr = this.valueStringConfiguration.split('#')
      this.minStorage = Number.parseInt(arr[0])
      this.stepStorage = Number.parseInt(arr[1])
      this.maxStorage = Number.parseInt(arr[2])
    })
  }


  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    this.router.navigate(['/app-smart-cloud/file-system-snapshot/list']);
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
    this.typeVpc = project?.type;
  }

  userChangeProject(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/file-system-snapshot/list']);
  }
}
