import {Component, Inject, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {PackageBackupService} from "../../../shared/services/package-backup.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {OrderItem} from "../../../shared/models/price";
import {DataPayment, ItemPayment} from "../../instances/instances.model";
import {InstancesService} from "../../instances/instances.service";

export class DateBackupPackage {
  createdDate: Date
  expiredDate: Date
}

export class FormCreateBackupPackage {
  packageName: string
  sizeInGB: number
  vpcId:  string
  oneSMEAddonId: null
  serviceType: number
  serviceInstanceId: number
  customerId: number
  createDate: Date
  expireDate: Date
  saleDept: null
  saleDeptCode: null
  contactPersonEmail: null
  contactPersonPhone: null
  contactPersonName: null
  note: string
  createDateInContract: null
  am: null
  amManager: null
  isTrial: false
  offerId: null
  couponCode: null
  dhsxkd_SubscriptionId: null
  dSubscriptionNumber: null
  dSubscriptionType: null
  oneSME_SubscriptionId: null
  actionType: number
  regionId: number
  serviceName: string
  typeName: string
  userEmail: string
  actorEmail: string
}

@Component({
  selector: 'one-portal-create-package-backup',
  templateUrl: './create-package-backup.component.html',
  styleUrls: ['./create-package-backup.component.less'],
})
export class CreatePackageBackupComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  validateForm: FormGroup<{
    namePackage: FormControl<string>
    storage: FormControl<number>
    description: FormControl<string>
    time: FormControl<number>
  }> = this.fb.group({
    namePackage: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9 ]*$/),
      Validators.maxLength(70)]],
    storage: [1, [Validators.required]],
    description: [null as string, [Validators.maxLength(255)]],
    time: [1, [Validators.required]]
  })

  time = [
    {label: '1 tháng', value: 1},
    {label: '2 tháng', value: 2},
    {label: '3 tháng', value: 3},
    {label: '4 tháng', value: 4},
    {label: '5 tháng', value: 5},
    {label: '6 tháng', value: 6},
    {label: '7 tháng', value: 7},
    {label: '8 tháng', value: 8},
    {label: '9 tháng', value: 9},
    {label: '10 tháng', value: 10},
    {label: '11 tháng', value: 11},
    {label: '12 tháng', value: 12}
  ]

  timeSelected: any

  isLoading: boolean = false

  backupPackageDate: DateBackupPackage = new DateBackupPackage()


  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private instanceService: InstancesService) {
      this.validateForm.get('time').valueChanges.subscribe(data => {
        this.backupPackageDate.expiredDate = new Date(new Date()
          .setDate(this.backupPackageDate.createdDate.getDate() + data*30))
        this.getTotalAmount()
      })


  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  onTimeSelected(value) {
    console.log('value selected', value)
    this.getTotalAmount()
  }

  submitForm(){
    console.log(this.validateForm.getRawValue())

  }

  goBack(){
    this.router.navigate(['/app-smart-cloud/backup/packages'])
  }

  formCreateBackupPackage: FormCreateBackupPackage = new FormCreateBackupPackage()
  packageBackupInit() {
    this.formCreateBackupPackage.packageName = this.validateForm.get('namePackage').value
    this.formCreateBackupPackage.sizeInGB = this.validateForm.get('storage').value
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
    this.formCreateBackupPackage.serviceName = this.validateForm.controls.namePackage.value ;
    this.formCreateBackupPackage.typeName =
      "SharedKernel.IntegrationEvents.Orders.Specifications.BackupPackageCreateSpecificationSharedKernel.IntegrationEvents Version=1.0.0.0 Culture=neutral PublicKeyToken=null";
    this.formCreateBackupPackage.userEmail = this.tokenService.get()?.email;
    this.formCreateBackupPackage.actorEmail = this.tokenService.get()?.email;
  }

  totalAmountVolume = 0;
  totalAmountVolumeVAT = 0;
  orderItem: OrderItem = new OrderItem()
  unitPrice = 0

  getTotalAmount() {
    this.packageBackupInit()
    console.log('time', this.timeSelected)
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
      this.unitPrice = this.orderItem.orderItemPrices[0].unitPrice.amount
    });
  }

  ngOnInit() {
    this.backupPackageDate.createdDate = new Date()
    this.backupPackageDate.expiredDate = new Date(new Date().setDate(this.backupPackageDate.createdDate.getDate() + 30))
    console.log('time', this.validateForm.controls.time.value)
    console.log('storage', this.validateForm.controls.storage.value)
    this.getTotalAmount()
  }
}


