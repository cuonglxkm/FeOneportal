import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { addDays } from 'date-fns';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BackupPackageRequestModel } from 'src/app/shared/models/package-backup.model';
import { FormCreateSnapshotPackage, SnapshotPackageRequestModel } from 'src/app/shared/models/package-snapshot.model';
import { OrderItem } from '../../../shared/models/price';
import { PackageBackupService } from '../../../shared/services/package-backup.service';
import { DataPayment, ItemPayment } from '../../instances/instances.model';
import { InstancesService } from '../../instances/instances.service';
import { ServiceActionType, ServiceType } from 'src/app/shared/enums/common.enum';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';
import { debounceTime, finalize, Subject } from 'rxjs';
import { OrderService } from '../../../shared/services/order.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '../../../../../../app-kafka/src/app/core/i18n/i18n.service';

@Component({
  selector: 'one-portal-create-package-snapshot',
  templateUrl: './create-package-snapshot.component.html',
  styleUrls: ['./create-package-snapshot.component.less']
})
export class CreatePackageSnapshotComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  typeVPC: number;

  validateForm: FormGroup<{
    namePackage: FormControl<string>
    description: FormControl<string>
    time: FormControl<number>
  }> = this.fb.group({
    namePackage: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9]*$/),
      Validators.maxLength(70)]],
    description: [null as string, [Validators.maxLength(255)]],
    time: [1, [Validators.required]]
  });

  namePackage: string = '';
  storage: number = 1;
  orderItem: any;
  unitPrice = 0;
  dateString = new Date();
  expiredDate: Date = addDays(this.dateString, 30);

  isLoading: boolean = false;
  private searchSubject = new Subject<string>();
  private readonly debounceTimeMs = 500;
  totalAmount: number;
  totalPayment: number;
  totalVat: number;

  constructor(private router: Router,
              private orderService: OrderService,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private fb: NonNullableFormBuilder,
              private instanceService: InstancesService) {
    this.validateForm.get('time').valueChanges.subscribe(data => {
      this.getTotalAmount();
    });
    this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue) => {
      this.getTotalAmount();
    });
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.router.navigate(['/app-smart-cloud/snapshot/packages']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/snapshot/packages']);
  }

  navigateToPaymentSummary() {
    this.loadingCalculate = true;
    let request: SnapshotPackageRequestModel = new SnapshotPackageRequestModel();
    request.customerId = this.formCreateSnapshotPackage.customerId;
    request.createdByUserId = this.formCreateSnapshotPackage.customerId;
    request.note = 'create snapshot package';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.formCreateSnapshotPackage),
        specificationType: 'snapshotpackage_create',
        price: this.orderItem?.totalAmount?.amount,
        serviceDuration: this.validateForm.get('time').value
      }
    ];

    this.orderService.validaterOrder(request).subscribe(
      data => {
        var returnPath: string = window.location.pathname;
        this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request, path: returnPath } });
      },
      error => {
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.validate.order.fail'));
      }
    );
  }

  caculator(event) {
    this.validateForm.controls['time'].setValue(event);
    this.expiredDate = addDays(this.dateString, 30 * this.validateForm.get('time').value);
  }


  formCreateSnapshotPackage: FormCreateSnapshotPackage = new FormCreateSnapshotPackage();
  hddPrice = 0;
  ssdPrice = 0;
  numberHDD = 0;
  numberSSD = 0;
  loadingCalculate = false;

  packageBackupInit() {
    this.formCreateSnapshotPackage.packageName = this.validateForm.get('namePackage').value;
    this.formCreateSnapshotPackage.quotaHddSizeInGB = this.numberHDD;
    this.formCreateSnapshotPackage.quotaSsdSizeInGB = this.numberSSD;
    this.formCreateSnapshotPackage.description = this.validateForm.get('description').value;
    this.formCreateSnapshotPackage.projectId = this.project;
    this.formCreateSnapshotPackage.vpcId = this.project.toString();
    this.formCreateSnapshotPackage.oneSMEAddonId = null;
    this.formCreateSnapshotPackage.serviceType = ServiceType.SNAPSHOT_PACKET;
    this.formCreateSnapshotPackage.serviceInstanceId = 0;
    this.formCreateSnapshotPackage.customerId = this.tokenService.get()?.userId;
    this.formCreateSnapshotPackage.createDate = this.dateString;
    this.formCreateSnapshotPackage.expireDate = this.expiredDate;
    this.formCreateSnapshotPackage.saleDept = null;
    this.formCreateSnapshotPackage.saleDeptCode = null;
    this.formCreateSnapshotPackage.contactPersonEmail = null;
    this.formCreateSnapshotPackage.contactPersonPhone = null;
    this.formCreateSnapshotPackage.contactPersonName = null;
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
      'SharedKernel.IntegrationEvents.Orders.Specifications.SnapshotPackageCreateSpecification,SharedKernel.IntegrationEvents,Version=1.0.0.0,Culture=neutral,PublicKeyToken=null';
    this.formCreateSnapshotPackage.userEmail = this.tokenService.get()?.email;
    this.formCreateSnapshotPackage.actorEmail = this.tokenService.get()?.email;
    this.formCreateSnapshotPackage.type = 'HDD';
    this.formCreateSnapshotPackage.offerId = 0;
  }


  getTotalAmount() {
    if (this.numberSSD + this.numberHDD > 0) {
      this.loadingCalculate = true;
      this.packageBackupInit();
      let itemPayment: ItemPayment = new ItemPayment();
      itemPayment.orderItemQuantity = 1;
      itemPayment.specificationString = JSON.stringify(this.formCreateSnapshotPackage);
      itemPayment.specificationType = 'snapshotpackage_create';
      itemPayment.serviceDuration = this.validateForm.get('time').value;
      itemPayment.sortItem = 0;
      let dataPayment: DataPayment = new DataPayment();
      dataPayment.orderItems = [itemPayment];
      dataPayment.projectId = this.project;
      this.instanceService.getTotalAmount(dataPayment)
        .pipe(finalize(() => {
          this.loadingCalculate = false;
        }))
        .subscribe((result) => {
          this.orderItem = result.data;
          this.totalAmount = Math.round(result?.data?.totalAmount?.amount);
          this.totalPayment = Math.round(result?.data?.totalPayment?.amount);
          this.totalVat = Math.round(result?.data?.totalVAT?.amount);

          this.unitPrice = this.orderItem?.orderItemPrices[0]?.unitPrice.amount;
          const detailArray = this.ssdPrice = this.orderItem?.orderItemPrices[0]?.details;
          if (detailArray != null && detailArray.length > 0) {
            for (let item of detailArray) {
              if (item.typeName == 'volume-snapshot-hdd') {
                this.hddPrice = item.unitPrice.amount;
              } else if (item.typeName == 'volume-snapshot-ssd') {
                this.ssdPrice = item.unitPrice.amount;
              }
            }
          }
        });
    }
  }


  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    // this.customerId = this.tokenService.get()?.userId
    this.getTotalAmount();
    console.log(this.tokenService.get());

  }

  onChangeTime($event: any) {

  }

  checkPossiblePress(event: KeyboardEvent) {
    const key = event.key;
    if (isNaN(Number(key)) && key !== 'Backspace' && key !== 'Delete' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
      event.preventDefault();
    }
  }

  changeQuota() {
    this.searchSubject.next('');
  }
}


