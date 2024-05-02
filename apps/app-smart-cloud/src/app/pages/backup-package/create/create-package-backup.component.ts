import {Component, Inject, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {PackageBackupService} from "../../../shared/services/package-backup.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {OrderItem} from "../../../shared/models/price";
import {DataPayment, ItemPayment} from "../../instances/instances.model";
import {InstancesService} from "../../instances/instances.service";
import {BackupPackageRequestModel, FormCreateBackupPackage} from 'src/app/shared/models/package-backup.model';
import {getCurrentRegionAndProject} from "@shared";
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

export class DateBackupPackage {
  createdDate: Date
  expiredDate: Date
}

@Component({
  selector: 'one-portal-create-package-backup',
  templateUrl: './create-package-backup.component.html',
  styleUrls: ['./create-package-backup.component.less'],
})
export class CreatePackageBackupComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
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

  isLoading: boolean = false

  backupPackageDate: DateBackupPackage = new DateBackupPackage()


  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private instanceService: InstancesService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
    this.validateForm.get('time').valueChanges.subscribe(data => {
      this.backupPackageDate.expiredDate = new Date(new Date()
        .setDate(this.backupPackageDate.createdDate.getDate() + data * 30))
      this.getTotalAmount()
    })

    this.validateForm.get('storage').valueChanges.subscribe(data => {
      this.getTotalAmount()
    })

  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
    this.router.navigate(['/app-smart-cloud/backup/packages'])
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/backup/packages'])
  }


  // submitForm() {
  //   console.log(this.validateForm.getRawValue())
  //   if (this.validateForm.valid) {
  //     this.doCreate()
  //   } else {
  //     this.notification.warning('', 'Vui lòng nhập đầy đủ thông tin')
  //   }
  // }

  navigateToPaymentSummary() {
    this.getTotalAmount()
    if (this.validateForm.valid) {
      let request: BackupPackageRequestModel = new BackupPackageRequestModel()
      request.customerId = this.formCreateBackupPackage.customerId;
      request.createdByUserId = this.formCreateBackupPackage.customerId;
      request.note = 'tạo gói backup';
      request.orderItems = [
        {
          orderItemQuantity: 1,
          specification: JSON.stringify(this.formCreateBackupPackage),
          specificationType: 'backuppackage_create',
          price: this.orderItem?.totalPayment?.amount,
          serviceDuration: this.validateForm.get('time').value
        }
      ]
      var returnPath: string = '/app-smart-cloud/backup/packages/create'
      console.log('request', request)
      this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: request, path: returnPath}});
    } else {
      this.notification.warning('', this.i18n.fanyi('app.notification.warning.input'))
    }
  }

  doCreate() {
    this.isLoading = true
    this.getTotalAmount()
    let request: BackupPackageRequestModel = new BackupPackageRequestModel()
    request.customerId = this.formCreateBackupPackage.customerId;
    request.createdByUserId = this.formCreateBackupPackage.customerId;
    request.note = 'tạo gói backup';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.formCreateBackupPackage),
        specificationType: 'backuppackage_create',
        price: this.orderItem?.totalPayment?.amount,
        serviceDuration: this.validateForm.get('time').value
      }
    ]
    console.log('request', request)
    this.packageBackupService.createOrder(request).subscribe(data => {
      if (data != undefined || data != null) {
        //Case du tien trong tai khoan => thanh toan thanh cong : Code = 200
        if (data.code == 200) {
          this.isLoading = false;
          this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.notification.request.create.success'))
          this.router.navigate(['/app-smart-cloud/backup/packages']);
        }
        //Case ko du tien trong tai khoan => chuyen sang trang thanh toan VNPTPay : Code = 310
        else if (data.code == 310) {
          this.isLoading = false;
          // this.router.navigate([data.data]);
          window.location.href = data.data;
        }
      } else {
        this.isLoading = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.request.create.fail', data.message))
      }
    })
  }
  //
  // goBack() {
  //   this.router.navigate(['/app-smart-cloud/backup/packages'])
  // }


  formCreateBackupPackage: FormCreateBackupPackage = new FormCreateBackupPackage()

  packageBackupInit() {
    this.formCreateBackupPackage.packageName = this.validateForm.get('namePackage').value
    this.formCreateBackupPackage.sizeInGB = this.validateForm.get('storage').value
    this.formCreateBackupPackage.description = this.validateForm.get('description').value
    this.formCreateBackupPackage.vpcId = this.project.toString()
    this.formCreateBackupPackage.oneSMEAddonId = null
    this.formCreateBackupPackage.serviceType = 14
    this.formCreateBackupPackage.serviceInstanceId = 0;
    this.formCreateBackupPackage.customerId = this.tokenService.get()?.userId;
    this.formCreateBackupPackage.createDate = this.backupPackageDate.createdDate
    this.formCreateBackupPackage.expireDate = this.backupPackageDate.expiredDate
    this.formCreateBackupPackage.saleDept = null
    this.formCreateBackupPackage.saleDeptCode = null
    this.formCreateBackupPackage.contactPersonEmail = null
    this.formCreateBackupPackage.contactPersonPhone = null
    this.formCreateBackupPackage.contactPersonName = null
    this.formCreateBackupPackage.note = null;
    this.formCreateBackupPackage.createDateInContract = null;
    this.formCreateBackupPackage.am = null;
    this.formCreateBackupPackage.amManager = null;
    this.formCreateBackupPackage.isTrial = false;
    this.formCreateBackupPackage.couponCode = null;
    this.formCreateBackupPackage.dhsxkd_SubscriptionId = null;
    this.formCreateBackupPackage.dSubscriptionNumber = null;
    this.formCreateBackupPackage.dSubscriptionType = null;
    this.formCreateBackupPackage.oneSME_SubscriptionId = null;
    this.formCreateBackupPackage.actionType = 0;
    this.formCreateBackupPackage.regionId = this.region;
    this.formCreateBackupPackage.serviceName = this.validateForm.controls.namePackage.value;
    this.formCreateBackupPackage.typeName =
      "SharedKernel.IntegrationEvents.Orders.Specifications.BackupPackageCreateSpecificationSharedKernel.IntegrationEvents Version=1.0.0.0 Culture=neutral PublicKeyToken=null";
    this.formCreateBackupPackage.userEmail = this.tokenService.get()?.email;
    this.formCreateBackupPackage.actorEmail = this.tokenService.get()?.email;
  }

  orderItem: OrderItem = new OrderItem()
  unitPrice = 0

  getTotalAmount() {
    this.packageBackupInit()
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.formCreateBackupPackage);
    itemPayment.specificationType = 'backuppackage_create';
    itemPayment.serviceDuration = this.validateForm.get('time').value;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.instanceService.getTotalAmount(dataPayment).subscribe((result) => {
      console.log('thanh tien backup package', result.data);
      this.orderItem = result.data
      this.unitPrice = this.orderItem?.orderItemPrices[0]?.unitPrice.amount
    });
  }


  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    // this.customerId = this.tokenService.get()?.userId
    this.backupPackageDate.createdDate = new Date()
    this.backupPackageDate.expiredDate = new Date(new Date().setDate(this.backupPackageDate.createdDate.getDate() + 30))
    this.getTotalAmount()
  }
}


