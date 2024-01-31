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
  FormUpdateBackupPackageModel,
  PackageBackupModel
} from "../../../shared/models/package-backup.model";
import {OrderItem} from "../../../shared/models/price";
import {DataPayment, ItemPayment} from "../../instances/instances.model";
import {InstancesService} from "../../instances/instances.service";

@Component({
  selector: 'one-portal-edit-backup-package',
  templateUrl: './edit-backup-package.component.html',
  styleUrls: ['./edit-backup-package.component.less'],
})
export class EditBackupPackageComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  idBackupPackage: number

  validateForm: FormGroup<{
    storage: FormControl<number>
  }> = this.fb.group({
    storage: [1, [Validators.required]]
  })

  isLoading: boolean = false
  packageBackupModel: PackageBackupModel = new PackageBackupModel()

  isVisibleEdit: boolean = false
  isLoadingEdit: boolean = false

  storage: number

  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private instanceService: InstancesService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder) {
    this.validateForm.get('storage').valueChanges.subscribe(data => {
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
      this.storage = this.packageBackupModel.sizeInGB
      this.validateForm.controls.storage.setValue(this.packageBackupModel.sizeInGB)
    })
  }

  changeValueInput() {

  }

  showModalEdit() {
    this.isVisibleEdit = true
  }

  handleOk(){
    this.isVisibleEdit =  false
    this.update()
  }

  handleCancel() {
    this.isVisibleEdit = false
  }

  reset() {
    this.validateForm.reset()
  }

  formUpdateBackupPackageModel: FormUpdateBackupPackageModel = new FormUpdateBackupPackageModel()
  backupPackageInit() {
    this.formUpdateBackupPackageModel.packageName = this.packageBackupModel.packageName
    this.formUpdateBackupPackageModel.newSize = this.validateForm.get('storage').value
    this.formUpdateBackupPackageModel.description = this.packageBackupModel.description
    this.formUpdateBackupPackageModel.vpcId = this.project.toString()
    this.formUpdateBackupPackageModel.serviceType = 14
    this.formUpdateBackupPackageModel.serviceInstanceId = this.idBackupPackage;
    this.formUpdateBackupPackageModel.customerId = this.tokenService.get()?.userId;

    this.formUpdateBackupPackageModel.actionType = 4;
    this.formUpdateBackupPackageModel.regionId = this.region;
    this.formUpdateBackupPackageModel.serviceName = this.packageBackupModel.packageName
    this.formUpdateBackupPackageModel.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.BackupPackageCreateSpecificationSharedKernel.IntegrationEvents Version=1.0.0.0 Culture=neutral PublicKeyToken=null';
    this.formUpdateBackupPackageModel.userEmail = this.tokenService.get()?.email;
    this.formUpdateBackupPackageModel.actorEmail = this.tokenService.get()?.email;
  }

  totalAmountVolume = 0;
  totalAmountVolumeVAT = 0;
  orderItem: OrderItem = new OrderItem()
  unitPrice = 0

  getTotalAmount() {
    this.backupPackageInit()
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.formUpdateBackupPackageModel);
    itemPayment.specificationType = 'backuppacket_resize';
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.instanceService.getTotalAmount(dataPayment).subscribe((result) => {
      console.log('thanh tien backup package', result.data);
      this.orderItem = result.data
      this.unitPrice = this.orderItem.orderItemPrices[0].unitPrice.amount
    });
  }

  update() {
    console.log(this.validateForm.getRawValue())
    if(this.validateForm.valid) {
      this.doUpdate()
    }
  }

  doUpdate() {
    this.isLoading = true
    this.getTotalAmount()
    let request: BackupPackageRequestModel = new BackupPackageRequestModel()
    request.customerId = this.formUpdateBackupPackageModel.customerId;
    request.createdByUserId = this.formUpdateBackupPackageModel.customerId;
    request.note = 'cập nhật gói backup';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.formUpdateBackupPackageModel),
        specificationType: 'backuppacket_resize',
        price: this.orderItem?.totalPayment?.amount,
        serviceDuration: 0
      }
    ]
    console.log('request', request)
    this.packageBackupService.createOrder(request).subscribe(data => {
      if (data != undefined || data != null) {
        //Case du tien trong tai khoan => thanh toan thanh cong : Code = 200
        if (data.code == 200) {
          this.isLoading = false;
          this.notification.success('Thành công', 'Điều chỉnh dung lượng gói backup thành công.')
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
        this.notification.error('Thất bại', 'Điều chỉnh dung lượng gói backup thất bại.' + data.message)
      }
    })
  }

  ngOnInit() {
    this.idBackupPackage = Number.parseInt(this.route.snapshot.paramMap.get('id'))
    if(this.idBackupPackage) {
      this.getDetailPackageBackup(this.idBackupPackage)
      this.getTotalAmount()
    }
  }
}
