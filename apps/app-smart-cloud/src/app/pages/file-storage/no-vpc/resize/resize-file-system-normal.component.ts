import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FileSystemService } from '../../../../shared/services/file-system.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  FileSystemDetail,
  ResizeFileSystem,
  ResizeFileSystemRequestModel
} from '../../../../shared/models/file-system.model';
import { ProjectModel, RegionModel } from '../../../../../../../../libs/common-utils/src';
import { DataPayment, ItemPayment } from '../../../instances/instances.model';
import { InstancesService } from '../../../instances/instances.service';
import { OrderItem } from '../../../../shared/models/price';
import { debounceTime, Subject } from 'rxjs';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectService } from 'src/app/shared/services/project.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { ConfigurationsService } from '../../../../shared/services/configurations.service';
import { OrderService } from '../../../../shared/services/order.service';

@Component({
  selector: 'one-portal-resize-file-system-normal',
  templateUrl: './resize-file-system-normal.component.html',
  styleUrls: ['./resize-file-system-normal.component.less']
})
export class ResizeFileSystemNormalComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  idFileSystem: number;

  validateForm: FormGroup<{
    snapshot: FormControl<boolean>
    storage: FormControl<number>
  }> = this.fb.group({
    snapshot: [false],
    storage: [0, [Validators.required, Validators.pattern(/^[0-9]*$/)]]
  });

  storage: number = 0;
  isLoading: boolean = true;
  fileSystem: FileSystemDetail;

  resizeFileSystem: ResizeFileSystem = new ResizeFileSystem();

  isInitSnapshot: boolean = false;

  snapshot: any;

  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;
  dataSubjectStorage: Subject<any> = new Subject<any>();
  minStorage: number = 0;
  stepStorage: number = 0;
  valueStringConfiguration: string = '';

  constructor(private fb: NonNullableFormBuilder,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private fileSystemService: FileSystemService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private orderService: OrderService,
              private instanceService: InstancesService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private configurationsService: ConfigurationsService) {

  }

  regionChanged(region: RegionModel) {
    // this.region = region.regionId
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/list']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/list']);
  }

  getFileSystemById(id) {
    this.isLoading = true;
    this.fileSystemService.getFileSystemById(id, this.region, this.project).subscribe(data => {
      this.fileSystem = data;
      this.isLoading = false;
      // this.storage = this.fileSystem?.size;
      // this.validateForm.controls.storage.setValue(this.fileSystem?.size);
      this.validateForm.controls.snapshot.setValue(this.fileSystem?.isSnapshot);
      // this.getTotalAmount();
    }, error => {
      this.fileSystem = null;
      this.isLoading = false;
    });
  }


  initFileSystem() {
    this.resizeFileSystem.customerId = this.tokenService.get()?.userId;
    console.log('size', this.fileSystem?.size)
    if(this.fileSystem?.size != null) {
      this.resizeFileSystem.size = this.storage + this.fileSystem?.size;
    } else {
      this.resizeFileSystem.size = this.storage
    }
    this.resizeFileSystem.newOfferId = 0;
    this.resizeFileSystem.serviceType = 18;
    this.resizeFileSystem.actionType = 4;
    this.resizeFileSystem.serviceInstanceId = this.idFileSystem;
    this.resizeFileSystem.regionId = this.region;
    this.resizeFileSystem.serviceName = this.fileSystem?.name;
    this.resizeFileSystem.vpcId = this.project;
    this.resizeFileSystem.typeName = 'SharedKernel.IntegrationEvents.Orders.Specifications.ShareResizeSpecificationSharedKernel.IntegrationEvents Version=1.0.0.0 Culture=neutral PublicKeyToken=null';
    this.resizeFileSystem.userEmail = this.tokenService.get()?.email;
    this.resizeFileSystem.actorEmail = this.tokenService.get()?.email;
  }

  changeValueStorage(value) {
    this.dataSubjectStorage.next(value);
  }

  onChangeStorage() {
    this.dataSubjectStorage.pipe(debounceTime(700))
      .subscribe((res) => {
        if (res % this.stepStorage > 0) {
          this.notification.warning('', this.i18n.fanyi('app.notify.amount.capacity', {number: this.stepStorage}));
          this.storage = res - (res % this.stepStorage);
        }
        console.log('total amount');
        this.getTotalAmount();
      });
  }

  getTotalAmount() {
    this.initFileSystem();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.resizeFileSystem);
    itemPayment.specificationType = 'filestorage_resize';
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.instanceService.getTotalAmount(dataPayment).subscribe((result) => {
      console.log('thanh tien volume', result.data);
      this.orderItem = result.data;
      this.unitPrice = this.orderItem?.orderItemPrices[0]?.unitPrice.amount;
    });
  }

  navigateToPaymentSummary() {
    this.isLoading = true;
    this.initFileSystem();
    let request = new ResizeFileSystemRequestModel();
    request.customerId = this.resizeFileSystem.customerId;
    request.createdByUserId = this.resizeFileSystem.customerId;
    request.note = 'Điều chỉnh dung lượng File System';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.resizeFileSystem),
        specificationType: 'filestorage_resize',
        price: this.orderItem?.totalAmount.amount,
        serviceDuration: 1
      }
    ];
    console.log('request', request);
    this.orderService.validaterOrder(request).subscribe(data => {
      if(data.success) {
        var returnPath: string = '/app-smart-cloud/file-storage/file-system/resize/normal/' + this.idFileSystem;
        console.log('request', request);
        this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request, path: returnPath } });
      }
    }, error =>  {
      this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.detail)
    })
  }

  navigateToDetail() {
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/detail/' + this.idFileSystem]);
  }

  dateEdit: Date;
  maxStorage: number = 0;
  getConfigurations() {
    this.configurationsService.getConfigurations('BLOCKSTORAGE').subscribe(data => {
      this.valueStringConfiguration = data.valueString;
      const arr = this.valueStringConfiguration.split('#')
      this.minStorage = Number.parseInt(arr[0])
      this.stepStorage = Number.parseInt(arr[1])
      this.maxStorage = Number.parseInt(arr[2])
    })
  }


  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.idFileSystem = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('idFileSystem'));
    this.getFileSystemById(this.idFileSystem);
    this.onChangeStorage();
    this.getConfigurations();
  }
}
