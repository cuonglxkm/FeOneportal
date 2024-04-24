import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { RegionModel } from '../../../../shared/models/region.model';
import { ProjectModel } from '../../../../shared/models/project.model';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { FormOrderCreateStorage } from '../../../../shared/models/file-storage.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { FileStorageService } from '../../../../shared/services/file-storage.service';
import { DataPayment, ItemPayment } from '../../../instances/instances.model';
import { OrderItem } from '../../../../shared/models/price';

@Component({
  selector: 'one-portal-create-file-storage-normal',
  templateUrl: './create-file-storage-normal.component.html',
  styleUrls: ['./create-file-storage-normal.component.less']
})
export class CreateFileStorageNormalComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  validateForm: FormGroup<{
    storageFileSystem: FormControl<number>
    storageFileSystemSnapshot: FormControl<number>
    time: FormControl<number>
  }> = this.fb.group({
    storageFileSystem: [1, [Validators.required, Validators.pattern(/^[0-9]*$/)]],
    storageFileSystemSnapshot: [1, [Validators.required, Validators.pattern(/^[0-9]*$/)]],
    time: [1, [Validators.required, Validators.pattern(/^[0-9]*$/)]]
  });

  dataSubjectStorageFileSystem: Subject<any> = new Subject<any>();
  dataSubjectStorageFileSystemSnapshot: Subject<any> = new Subject<any>();

  storageFileSystem: number = 1;
  storageFileSystemSnapshot: number = 1;

  formOrderCreate: FormOrderCreateStorage = new FormOrderCreateStorage();

  unitPrice: number
  totalAmount: number

  orderItem: OrderItem = new OrderItem();

  constructor(private router: Router,
              private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private fileStorageService: FileStorageService) {
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

  onKeyDown(event: KeyboardEvent) {
    // Lấy giá trị của phím được nhấn
    const key = event.key;
    // Kiểm tra xem phím nhấn có phải là một số hoặc phím di chuyển không
    if (
      (isNaN(Number(key)) &&
        key !== 'Backspace' &&
        key !== 'Delete' &&
        key !== 'ArrowLeft' &&
        key !== 'ArrowRight') ||
      key === '.'
    ) {
      // Nếu không phải số hoặc đã nhập dấu chấm và đã có dấu chấm trong giá trị hiện tại
      event.preventDefault(); // Hủy sự kiện để ngăn người dùng nhập ký tự đó
    }
  }

  changeStorageFileSystem(value) {
    this.dataSubjectStorageFileSystem.next(value);
  }

  onChangeStorageFileSystem() {
    this.dataSubjectStorageFileSystem
      .pipe(debounceTime(500))
      .subscribe((res) => {
        console.log('storage', this.validateForm.get('storageFileSystem').value);
        //get total amount
        this.getTotalAmount()
      });
  }

  changeStorageFileSystemSnapshot(value) {
    this.dataSubjectStorageFileSystemSnapshot.next(value);
  }

  onChangeStorageFileSystemSnapshot() {
    this.dataSubjectStorageFileSystem
      .pipe(debounceTime(500))
      .subscribe((res) => {
        console.log('storage', this.validateForm.get('storageFileSystemSnapshot').value);
        //get total amount
        this.getTotalAmount()
      });
  }

  fileStorageInit() {
    this.formOrderCreate.projectId = this.project;
    this.formOrderCreate.shareProtocol = null;
    this.formOrderCreate.size = null;
    this.formOrderCreate.name = null;
    this.formOrderCreate.description = null;
    this.formOrderCreate.displayName = null;
    this.formOrderCreate.displayDescription = null;
    this.formOrderCreate.shareType = null;
    this.formOrderCreate.snapshotId = null;
    this.formOrderCreate.isPublic = false;
    this.formOrderCreate.shareGroupId = null;
    this.formOrderCreate.metadata = null;
    this.formOrderCreate.shareNetworkId = null;
    this.formOrderCreate.availabilityZone = null;
    this.formOrderCreate.schedulerHints = null;
    this.formOrderCreate.actorId = 0;
    this.formOrderCreate.vpcId = this.project;
    this.formOrderCreate.customerId = this.tokenService.get()?.userId;
    this.formOrderCreate.userEmail = this.tokenService.get()?.email;
    this.formOrderCreate.actorEmail = this.tokenService.get()?.email;
    this.formOrderCreate.regionId = this.region;
    this.formOrderCreate.serviceName = null;
    this.formOrderCreate.serviceType = 100;
    this.formOrderCreate.actionType = 0;
    this.formOrderCreate.serviceInstanceId = 0;
    this.formOrderCreate.createDateInContract = null;
    this.formOrderCreate.saleDept = null;
    this.formOrderCreate.saleDeptCode = null;
    this.formOrderCreate.contactPersonEmail = null;
    this.formOrderCreate.contactPersonPhone = null;
    this.formOrderCreate.contactPersonName = null;
    this.formOrderCreate.am = null;
    this.formOrderCreate.amManager = null;
    this.formOrderCreate.note = null;
    this.formOrderCreate.isTrial = false;
    this.formOrderCreate.offerId = 0;
    this.formOrderCreate.couponCode = null;
    this.formOrderCreate.dhsxkd_SubscriptionId = null;
    this.formOrderCreate.dSubscriptionNumber = null;
    this.formOrderCreate.dSubscriptionType = null;
    this.formOrderCreate.oneSMEAddonId = null;
    this.formOrderCreate.oneSME_SubscriptionId = null;
    this.formOrderCreate.typeName = 'SharedKernel.IntegrationEvents.Orders.Specifications.ShareCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
  }

  getTotalAmount() {
    this.fileStorageInit()
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.formOrderCreate);
    itemPayment.specificationType = 'filestorage_create';
    itemPayment.serviceDuration = this.validateForm.get('time').value;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.fileStorageService.getTotalAmount(dataPayment).subscribe((result) => {
      this.orderItem = result?.data
      this.unitPrice = this.orderItem?.orderItemPrices[0]?.unitPrice.amount
      this.totalAmount = this.orderItem?.totalAmount?.amount
    })
  }


  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.onChangeStorageFileSystem();
    this.onChangeStorageFileSystemSnapshot();
  }
}
