import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FileSystemService } from '../../../../shared/services/file-system.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { InstancesService } from '../../../instances/instances.service';
import {
  ExtendFileSystem,
  FileSystemDetail,
  ResizeFileSystemRequestModel
} from '../../../../shared/models/file-system.model';
import { OrderItem } from '../../../../shared/models/price';
import { debounceTime, Subject } from 'rxjs';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel, RegionModel } from '../../../../../../../../libs/common-utils/src';
import { DataPayment, ItemPayment } from '../../../instances/instances.model';
import { ProjectService } from 'src/app/shared/services/project.service';
import { ConfigurationsService } from '../../../../shared/services/configurations.service';
import { OrderService } from '../../../../shared/services/order.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';


@Component({
  selector: 'one-portal-extend-file-system-normal',
  templateUrl: './extend-file-system-normal.component.html',
  styleUrls: ['./extend-file-system-normal.component.less']
})
export class ExtendFileSystemNormalComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  idFileSystem: number;

  storage: number;
  isLoading: boolean = true;

  isLoadingAction: boolean = false
  fileSystem: FileSystemDetail;

  isInitSnapshot: boolean = false;

  snapshot: any;

  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;
  dataSubjectTime: Subject<any> = new Subject<any>();

  validateForm: FormGroup<{
    snapshot: FormControl<boolean>
    time: FormControl<number>
  }> = this.fb.group({
    snapshot: [false],
    time: [1, [Validators.required, Validators.pattern(/^[0-9]*$/)]]
  });

  estimateExpireDate: Date = null;

  extendFileSystem: ExtendFileSystem = new ExtendFileSystem();

  minStorage: number = 0;
  stepStorage: number = 0;
  valueStringConfiguration: string = '';
  maxStorage: number = 0;

  timeSelected: any

  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  closePopupError() {
    this.isVisiblePopupError = false;
  }
  constructor(private fb: NonNullableFormBuilder,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private fileSystemService: FileSystemService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private projectService: ProjectService,
              private instanceService: InstancesService,
              private configurationsService: ConfigurationsService,
              private orderService: OrderService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  regionChanged(region: RegionModel) {
    // this.region = region.regionId
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

  changeTime(value) {
    this.dataSubjectTime.next(value);
  }

  onChangeTime(value) {
      // this.dataSubjectTime.pipe(debounceTime(500))
      //   .subscribe((res) => {
    this.timeSelected = value
    this.validateForm.controls.time.setValue(this.timeSelected)
          this.getTotalAmount();
        // })
  }

  getFileSystemById(id) {
    this.isLoading = true;
    this.fileSystemService.getFileSystemById(id, this.region, this.project).subscribe(data => {
      this.fileSystem = data;
      this.isLoading = false;
      this.storage = this.fileSystem.size;
      // this.validateForm.controls.storage.setValue(this.fileSystem.size);
      if (this.fileSystem?.shareSnapshotId == null) {
        this.isInitSnapshot = false;
      } else {
        this.isInitSnapshot = true;
      }
      this.validateForm.controls.snapshot.setValue(this.isInitSnapshot);
      const oldDate = new Date(this.fileSystem?.expireDate);
      this.estimateExpireDate = oldDate;
      const exp = this.estimateExpireDate.setDate(oldDate.getDate() + 30);
      this.estimateExpireDate = new Date(exp);
      this.getTotalAmount();
    }, error => {
      this.fileSystem = null;
      this.isLoading = false;
    });
  }

  fileSystemInit() {
    this.extendFileSystem.regionId = this.region
    this.extendFileSystem.serviceName = this.fileSystem?.name
    this.extendFileSystem.customerId = this.tokenService.get()?.userId
    this.extendFileSystem.projectId = this.project
    this.extendFileSystem.vpcId = this.project
    this.extendFileSystem.typeName = "SharedKernel.IntegrationEvents.Orders.Specifications.FileSystemExtendSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null"
    this.extendFileSystem.serviceType = 18
    this.extendFileSystem.actionType = 3
    this.extendFileSystem.serviceInstanceId = this.idFileSystem
    this.extendFileSystem.newExpireDate = this.estimateExpireDate
    this.extendFileSystem.userEmail = this.tokenService.get()?.email
    this.extendFileSystem.actorEmail = this.tokenService.get()?.email
  }

  getTotalAmount() {
    this.isLoadingAction = true
    this.fileSystemInit()
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.extendFileSystem);
    itemPayment.specificationType = 'filestorage_extend';
    itemPayment.sortItem = 0;
    itemPayment.serviceDuration = this.validateForm.controls.time.value;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;

    this.instanceService.getTotalAmount(dataPayment).subscribe((result) => {
      this.isLoadingAction = false
      console.log('thanh tien extend', result.data);
      this.orderItem = result.data;
      this.unitPrice = this.orderItem?.orderItemPrices[0]?.unitPrice.amount;
    });
  }

  navigateToPaymentSummary() {
    this.isLoadingAction = true
    this.fileSystemInit();
    this.getTotalAmount()
    let request = new ResizeFileSystemRequestModel();
    request.customerId = this.extendFileSystem.customerId;
    request.createdByUserId = this.extendFileSystem.customerId;
    request.note = 'Gia hạn File System';
    request.totalPayment = this.orderItem?.totalPayment?.amount
    request.totalVAT = this.orderItem?.totalVAT?.amount
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.extendFileSystem),
        specificationType: 'filestorage_extend',
        price: this.orderItem?.totalAmount.amount,
        serviceDuration: this.validateForm.controls.time.value
      }
    ];
    console.log('request', request);
    this.orderService.validaterOrder(request).subscribe(data => {
      this.isLoadingAction = false
      if(data.success) {
        var returnPath: string = '/app-smart-cloud/file-storage/file-system/' + this.idFileSystem + '/extend';
        console.log('request', request);
        this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request, path: returnPath } });
      } else {
        this.isVisiblePopupError = true;
        this.errorList = data.data;
      }

    }, error => {
      this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.detail)
    })
  }

  doExtend() {
    this.isLoadingAction = true
    this.fileSystemInit();
    this.getTotalAmount()
    let request = new ResizeFileSystemRequestModel();
    request.customerId = this.extendFileSystem.customerId;
    request.createdByUserId = this.extendFileSystem.customerId;
    request.note = 'Gia hạn File System';
    request.totalPayment = this.orderItem?.totalPayment?.amount
    request.totalVAT = this.orderItem?.totalVAT?.amount
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.extendFileSystem),
        specificationType: 'filestorage_extend',
        price: this.orderItem?.totalAmount.amount,
        serviceDuration: this.validateForm.controls.time.value
      }
    ];
    console.log('request', request);
    this.orderService.validaterOrder(request).subscribe(data => {
      this.isLoadingAction = false
      if(data.success) {

      } else {
        this.isVisiblePopupError = true;
        this.errorList = data.data;
      }

    }, error => {
      this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.detail)
    })
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

  hasRoleSI: boolean
  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.hasRoleSI = localStorage.getItem('role').includes('SI')

    this.idFileSystem = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('idFileSystem'));
    this.getFileSystemById(this.idFileSystem);
    // this.onChangeTime()
    this.getConfigurations();
  }
}
