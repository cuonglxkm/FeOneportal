import {Component, Inject, OnInit} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {ActivatedRoute, Router} from "@angular/router";
import {PackageBackupService} from "../../../shared/services/package-backup.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {
  BackupPackageRequestModel,
  FormExtendBackupPackageModel,
  PackageBackupModel
} from "../../../shared/models/package-backup.model";
import {OrderItem} from "../../../shared/models/price";
import {DataPayment, ItemPayment} from "../../instances/instances.model";
import {InstancesService} from "../../instances/instances.service";

@Component({
  selector: 'one-portal-extend-backup-package',
  templateUrl: './extend-backup-package.component.html',
  styleUrls: ['./extend-backup-package.component.less'],
})
export class ExtendBackupPackageComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false

  idBackupPackage: number

  packageBackupModel: PackageBackupModel = new PackageBackupModel()

  validateForm: FormGroup<{
    time: FormControl<number>
  }> = this.fb.group({
    time: [1, [Validators.required]]
  })

  estimateExpiredDate: Date
  expiredDate: Date

  isVisibleConfirmExtend: boolean = false
  isLoadingExtend: boolean = false

  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder,
              private instanceService: InstancesService) {
    this.validateForm.get('time').valueChanges.subscribe(data => {
      this.estimateExpiredDate = new Date(new Date().setDate(new Date(this.expiredDate).getDate() + data*30))
      this.getTotalAmount()
    })
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  getDetailPackageBackup(id) {
    this.packageBackupService.detail(id).subscribe(data => {
      console.log('data', data)
      this.packageBackupModel = data
      this.expiredDate = this.packageBackupModel.expirationDate
      console.log('estimate', new Date(new Date().setDate(new Date(this.expiredDate).getDate() + 30)))
      this.estimateExpiredDate = new Date(new Date().setDate(new Date(this.expiredDate).getDate() + 30))
      this.getTotalAmount()
    })
  }

  submitForm() {
    if(this.validateForm.valid) {
      this.doExtend()
    }
  }

  doExtend() {
    this.isLoading = true
    this.getTotalAmount()
    let request: BackupPackageRequestModel = new BackupPackageRequestModel()
    request.customerId = this.formExtendBackupPackage.customerId;
    request.createdByUserId = this.formExtendBackupPackage.customerId;
    request.note = 'gia hạn gói backup';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.formExtendBackupPackage),
        specificationType: 'backuppacket_extend',
        price: this.orderItem?.totalPayment?.amount,
        serviceDuration: this.validateForm.controls.time.value
      }
    ]
    console.log('request', request)
    this.packageBackupService.createOrder(request).subscribe(data => {
      if (data != undefined || data != null) {
        //Case du tien trong tai khoan => thanh toan thanh cong : Code = 200
        if (data.code == 200) {
          this.isLoading = false;
          this.notification.success('Thành công', 'Gia hạn gói backup thành công.')
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
        this.notification.error('Thất bại', 'Gia hạn gói backup thất bại.' + data.message)
      }
    })
  }

  showConfirmExtend() {
    this.isVisibleConfirmExtend = true
  }

  handleOk() {
    this.isVisibleConfirmExtend = false
    this.submitForm()
  }

  handleCancel() {
    this.isVisibleConfirmExtend = false
  }

  reset() {
    this.validateForm.reset()
  }

  formExtendBackupPackage: FormExtendBackupPackageModel = new FormExtendBackupPackageModel()
  backupPackageInit() {
    this.formExtendBackupPackage.regionId = this.region
    this.formExtendBackupPackage.serviceName = this.packageBackupModel.packageName
    this.formExtendBackupPackage.customerId = this.packageBackupModel.customerId
    this.formExtendBackupPackage.vpcId = this.project.toString()
    this.formExtendBackupPackage.typeName = 'SharedKernel.IntegrationEvents.Orders.Specifications.BackupPacketExtendSpecificationSharedKernel.IntegrationEvents Version=1.0.0.0 Culture=neutral PublicKeyToken=null'
    this.formExtendBackupPackage.serviceType = 14
    this.formExtendBackupPackage.actionType = 3
    this.formExtendBackupPackage.serviceInstanceId = this.packageBackupModel.id
    this.formExtendBackupPackage.newExpireDate = this.estimateExpiredDate
    this.formExtendBackupPackage.userEmail = this.tokenService.get()?.email;
    this.formExtendBackupPackage.actorEmail = this.tokenService.get()?.email;
  }

  totalAmountVolume = 0;
  totalAmountVolumeVAT = 0;
  orderItem: OrderItem = new OrderItem()
  unitPrice = 0

  getTotalAmount() {
    this.backupPackageInit()
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.formExtendBackupPackage);
    itemPayment.specificationType = 'backuppacket_extend';
    itemPayment.sortItem = 0;
    itemPayment.serviceDuration = this.validateForm.controls.time.value
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.instanceService.getTotalAmount(dataPayment).subscribe((result) => {
      console.log('thanh tien backup package', result.data);
      this.orderItem = result.data
      this.unitPrice = this.orderItem.orderItemPrices[0].unitPrice.amount
      this.estimateExpiredDate = this.orderItem.orderItemPrices[0].expiredDate
    });
  }

  ngOnInit() {
    this.idBackupPackage = Number.parseInt(this.route.snapshot.paramMap.get('id'))
    if(this.idBackupPackage) {
      this.getDetailPackageBackup(this.idBackupPackage)

      // this.getTotalAmount()
    }
  }
}
