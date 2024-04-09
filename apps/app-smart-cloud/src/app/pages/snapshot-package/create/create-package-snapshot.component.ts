import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
import { getCurrentRegionAndProject } from "@shared";
import { addDays } from 'date-fns';
import { NzNotificationService } from "ng-zorro-antd/notification";
import { BackupPackageRequestModel } from 'src/app/shared/models/package-backup.model';
import { FormCreateSnapshotPackage } from 'src/app/shared/models/package-snapshot.model';
import { OrderItem } from "../../../shared/models/price";
import { ProjectModel } from "../../../shared/models/project.model";
import { RegionModel } from "../../../shared/models/region.model";
import { PackageBackupService } from "../../../shared/services/package-backup.service";
import { DataPayment, ItemPayment } from "../../instances/instances.model";
import { InstancesService } from "../../instances/instances.service";
import { ServiceActionType, ServiceType } from 'src/app/shared/enums/common.enum';

@Component({
  selector: 'one-portal-create-package-snapshot',
  templateUrl: './create-package-snapshot.component.html',
  styleUrls: ['./create-package-snapshot.component.less'],
})
export class CreatePackageSnapshotComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  typeVPC: number

  validateForm: FormGroup<{
    namePackage: FormControl<string>
    storage: FormControl<number>
    description: FormControl<string>
    time: FormControl<number>
  }> = this.fb.group({
    namePackage: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9]*$/),
      Validators.maxLength(70)]],
    storage: [1, [Validators.required]],
    description: [null as string, [Validators.maxLength(255)]],
    time: [1, [Validators.required]]
  })

  namePackage: string = ''
  storage: number = 1
  orderItem: OrderItem = new OrderItem()
  unitPrice = 0
  dateString = new Date();
  expiredDate: Date = addDays(this.dateString, 30);

  isLoading: boolean = false



  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private instanceService: InstancesService) {
    this.validateForm.get('time').valueChanges.subscribe(data => {
      this.getTotalAmount()
    })

    this.validateForm.get('storage').valueChanges.subscribe(data => {
      this.getTotalAmount()
    })

  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
    this.router.navigate(['/app-smart-cloud/snapshot/packages'])
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/snapshot/packages'])
  }


  navigateToPaymentSummary() {
    this.getTotalAmount()
    if (this.validateForm.valid) {
      let request: BackupPackageRequestModel = new BackupPackageRequestModel()
      request.customerId = this.formCreateSnapshotPackage.customerId;
      request.createdByUserId = this.formCreateSnapshotPackage.customerId;
      request.note = 'tạo gói backup';
      request.orderItems = [
        {
          orderItemQuantity: 1,
          specification: JSON.stringify(this.formCreateSnapshotPackage),
          specificationType: 'snapshotpackage_create',
          price: this.orderItem?.totalPayment?.amount,
          serviceDuration: this.validateForm.get('time').value
        }
      ]
      var returnPath: string = '/app-smart-cloud/backup/packages/create'
      console.log('request', request)
      this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: request, path: returnPath}});
    } else {
      this.notification.warning('', 'Vui lòng nhập đầy đủ thông tin')
    }
  }

  caculator(event) {
    this.expiredDate = addDays(this.dateString, 30 * this.validateForm.get('time').value);
  }


  formCreateSnapshotPackage: FormCreateSnapshotPackage = new FormCreateSnapshotPackage()

  packageBackupInit() {
    this.formCreateSnapshotPackage.packageName = this.validateForm.get('namePackage').value
    this.formCreateSnapshotPackage.sizeInGB = this.validateForm.get('storage').value
    this.formCreateSnapshotPackage.description = this.validateForm.get('description').value
    this.formCreateSnapshotPackage.projectId = this.project
    this.formCreateSnapshotPackage.oneSMEAddonId = null
    this.formCreateSnapshotPackage.serviceType = ServiceType.SNAPSHOT_PACKET
    this.formCreateSnapshotPackage.serviceInstanceId = 0;
    this.formCreateSnapshotPackage.customerId = this.tokenService.get()?.userId;
    this.formCreateSnapshotPackage.createDate = this.dateString
    this.formCreateSnapshotPackage.expireDate = this.expiredDate
    this.formCreateSnapshotPackage.saleDept = null
    this.formCreateSnapshotPackage.saleDeptCode = null
    this.formCreateSnapshotPackage.contactPersonEmail = null
    this.formCreateSnapshotPackage.contactPersonPhone = null
    this.formCreateSnapshotPackage.contactPersonName = null
    this.formCreateSnapshotPackage.note = null;
    this.formCreateSnapshotPackage.createDateInContract = null;
    this.formCreateSnapshotPackage.am = null;
    this.formCreateSnapshotPackage.amManager = null;
    this.formCreateSnapshotPackage.isTrial = false;
    this.formCreateSnapshotPackage.couponCode = null;
    this.formCreateSnapshotPackage.dhsxkd_SubscriptionId = null;
    this.formCreateSnapshotPackage.dSubscriptionNumber = null;
    this.formCreateSnapshotPackage.dSubscriptionType = null;
    this.formCreateSnapshotPackage.oneSME_SubscriptionId = null;
    this.formCreateSnapshotPackage.actionType = ServiceActionType.CREATE;
    this.formCreateSnapshotPackage.regionId = this.region;
    this.formCreateSnapshotPackage.serviceName = this.validateForm.controls.namePackage.value;
    this.formCreateSnapshotPackage.typeName =
      "SharedKernel.IntegrationEvents.Orders.Specifications.SnapshotPackageCreateSpecification,SharedKernel.IntegrationEvents,Version=1.0.0.0,Culture=neutral,PublicKeyToken=null";
    this.formCreateSnapshotPackage.userEmail = this.tokenService.get()?.email;
    this.formCreateSnapshotPackage.actorEmail = this.tokenService.get()?.email;
  }



  getTotalAmount() {
    this.packageBackupInit()
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.formCreateSnapshotPackage);
    itemPayment.specificationType = 'snapshotpackage_create';
    itemPayment.serviceDuration = this.validateForm.get('time').value;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.instanceService.getTotalAmount(dataPayment).subscribe((result) => {
      this.orderItem = result.data
      this.unitPrice = this.orderItem?.orderItemPrices[0]?.unitPrice.amount
    });
  }


  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    // this.customerId = this.tokenService.get()?.userId
    this.getTotalAmount()
  }
}


