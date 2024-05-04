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
import { ProjectService, RegionModel, ProjectModel } from '../../../../../../../../libs/common-utils/src';
import { DataPayment, ItemPayment } from '../../../instances/instances.model';
import { InstancesService } from '../../../instances/instances.service';
import { OrderItem } from '../../../../shared/models/price';
import { debounceTime, Subject } from 'rxjs';
import { getCurrentRegionAndProject } from '@shared';

@Component({
  selector: 'one-portal-resize-file-system-normal',
  templateUrl: './resize-file-system-normal.component.html',
  styleUrls: ['./resize-file-system-normal.component.less'],
})
export class ResizeFileSystemNormalComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  idFileSystem: number;

  validateForm: FormGroup<{
    snapshot: FormControl<boolean>
    storage: FormControl<number>
  }> = this.fb.group({
    snapshot: [false],
    storage: [1, [Validators.required]]
  });

  storage: number;
  isLoading: boolean = false;
  fileSystem: FileSystemDetail = new FileSystemDetail();

  resizeFileSystem: ResizeFileSystem = new ResizeFileSystem();

  isInitSnapshot: boolean = false

  snapshot: any

  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;
  dataSubjectStorage: Subject<any> = new Subject<any>();

  constructor(private fb: NonNullableFormBuilder,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private fileSystemService: FileSystemService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private projectService: ProjectService,
              private instanceService: InstancesService,) {
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
    this.fileSystemService.getFileSystemById(id, this.region).subscribe(data => {
      this.fileSystem = data;
      this.isLoading = false;
      this.storage = this.fileSystem.size;
      // this.validateForm.controls.storage.setValue(this.fileSystem?.size);
      this.validateForm.controls.snapshot.setValue(this.fileSystem?.isSnapshot)
    }, error => {
      this.fileSystem = null;
      this.isLoading = false;
    });
  }


  initFileSystem() {
    this.resizeFileSystem.customerId = this.tokenService.get()?.userId;
    this.resizeFileSystem.size = this.validateForm.controls.storage.value;
    this.resizeFileSystem.newOfferId = 0;
    this.resizeFileSystem.serviceType = 18;
    this.resizeFileSystem.actionType = 4;
    this.resizeFileSystem.serviceInstanceId = this.idFileSystem;
    this.resizeFileSystem.regionId = this.region;
    this.resizeFileSystem.serviceName = this.fileSystem.name;
    this.resizeFileSystem.vpcId = this.project;
    this.resizeFileSystem.typeName = 'SharedKernel.IntegrationEvents.Orders.Specifications.ShareResizeSpecificationSharedKernel.IntegrationEvents Version=1.0.0.0 Culture=neutral PublicKeyToken=null';
    this.resizeFileSystem.userEmail = this.tokenService.get()?.email;
    this.resizeFileSystem.actorEmail = this.tokenService.get()?.email;
  }

  changeValueStorage(value) {
    this.dataSubjectStorage.next(value);
  }

  onChangeStorage() {
    this.dataSubjectStorage.pipe(debounceTime(500))
      .subscribe((res) => {
        console.log('total amount');
        this.getTotalAmount()
      })
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
        serviceDuration: 1
      }
    ];
    console.log('request', request);
    var returnPath: string = '/app-smart-cloud/file-storage/file-system/' + this.idFileSystem + '/resize';
    console.log('request', request);
    this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request, path: returnPath } });
  }

  getMonthDifference(expiredDateStr: string, createdDateStr: string): number {
    // Chuyển đổi chuỗi thành đối tượng Date
    const expiredDate = new Date(expiredDateStr);
    const createdDate = new Date(createdDateStr);

    // Tính số tháng giữa hai ngày
    const oneDay = 24 * 60 * 60 * 1000; // Số mili giây trong một ngày
    const diffDays = Math.round(Math.abs((expiredDate.getTime() - createdDate.getTime()) / oneDay)); // Số ngày chênh lệch
    const diffMonths = Math.floor(diffDays / 30); // Số tháng dựa trên số ngày, mỗi tháng có 30 ngày
    return diffMonths;
  }

  dateEdit: Date
  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.idFileSystem = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('idFileSystem'));
    this.getFileSystemById(this.idFileSystem);
    this.onChangeStorage();
    this.dateEdit = new Date();
    this.getTotalAmount()
  }
}
