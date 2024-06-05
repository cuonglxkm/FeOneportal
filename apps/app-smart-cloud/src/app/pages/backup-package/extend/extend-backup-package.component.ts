import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PackageBackupService } from '../../../shared/services/package-backup.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import {
  BackupPackageRequestModel,
  FormExtendBackupPackageModel,
  PackageBackupModel
} from '../../../shared/models/package-backup.model';
import { OrderItem } from '../../../shared/models/price';
import { DataPayment, ItemPayment } from '../../instances/instances.model';
import { InstancesService } from '../../instances/instances.service';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { ProjectService } from 'src/app/shared/services/project.service';
import { Subject } from 'rxjs';
import { OrderService } from '../../../shared/services/order.service';

@Component({
  selector: 'one-portal-extend-backup-package',
  templateUrl: './extend-backup-package.component.html',
  styleUrls: ['./extend-backup-package.component.less']
})
export class ExtendBackupPackageComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = true;

  idBackupPackage: number;

  packageBackupModel: PackageBackupModel;

  validateForm: FormGroup<{
    time: FormControl<number>
  }> = this.fb.group({
    time: [1, [Validators.required]]
  });

  estimateExpiredDate: Date;

  isLoadingAction: boolean = false;

  dataSubjectTime: Subject<any> = new Subject<any>();

  timeSelected: any;

  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder,
              private instanceService: InstancesService,
              private projectService: ProjectService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private orderService: OrderService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.router.navigate(['/app-smart-cloud/backup/packages']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/backup/packages']);
  }

  changeTime(value) {
    this.dataSubjectTime.next(value);
  }

  onChangeTime(value) {
    // this.dataSubjectTime.pipe(debounceTime(500))
    //   .subscribe((res) => {
    this.timeSelected = value;
    this.validateForm.controls.time.setValue(this.timeSelected);
    this.getTotalAmount();
    // });
  }

  getDetailPackageBackup(id) {
    this.isLoading = true;
    this.packageBackupService.detail(id).subscribe(data => {
      this.isLoading = false;
      console.log('data', data);
      this.packageBackupModel = data;
      this.getTotalAmount();
    });
  }

  navigateToPaymentSummary() {
    this.isLoadingAction = true;
    this.getTotalAmount();
    let request: BackupPackageRequestModel = new BackupPackageRequestModel();
    request.customerId = this.formExtendBackupPackage.customerId;
    request.createdByUserId = this.formExtendBackupPackage.customerId;
    request.note = this.i18n.fanyi('app.backup.package.breadcrumb.extend');
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.formExtendBackupPackage),
        specificationType: 'backuppacket_extend',
        price: this.orderItem?.totalPayment?.amount,
        serviceDuration: this.validateForm.controls.time.value
      }
    ];
    this.orderService.validaterOrder(request).subscribe(data => {
      this.isLoadingAction = false;
      if (data.success) {
        var returnPath: string = '/app-smart-cloud/backup/packages/extend/' + this.idBackupPackage;
        console.log('request', request);
        this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request, path: returnPath } });
      }
    }, error => {
      this.isLoadingAction = false;
      console.log('error', error);
      this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.detail);
    });
  }

  // doExtend() {
  //   this.isLoading = true;
  //
  //   console.log('request', request);
  //   this.packageBackupService.createOrder(request).subscribe(data => {
  //     if (data != undefined || data != null) {
  //       //Case du tien trong tai khoan => thanh toan thanh cong : Code = 200
  //       if (data.code == 200) {
  //         this.isLoading = false;
  //         this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.notification.extend.success'));
  //         this.router.navigate(['/app-smart-cloud/backup/packages']);
  //       }
  //       //Case ko du tien trong tai khoan => chuyen sang trang thanh toan VNPTPay : Code = 310
  //       else if (data.code == 310) {
  //         this.isLoading = false;
  //         // this.router.navigate([data.data]);
  //         window.location.href = data.data;
  //       }
  //     } else {
  //       this.isLoading = false;
  //       this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.extend.fail'));
  //     }
  //   });
  // }

  formExtendBackupPackage: FormExtendBackupPackageModel = new FormExtendBackupPackageModel();

  backupPackageInit() {
    this.formExtendBackupPackage.regionId = this.region;
    this.formExtendBackupPackage.serviceName = this.packageBackupModel?.packageName;
    this.formExtendBackupPackage.customerId = this.packageBackupModel?.customerId;
    this.formExtendBackupPackage.projectId = this.project;
    this.formExtendBackupPackage.vpcId = this.project.toString();
    this.formExtendBackupPackage.typeName = 'SharedKernel.IntegrationEvents.Orders.Specifications.BackupPacketExtendSpecificationSharedKernel.IntegrationEvents Version=1.0.0.0 Culture=neutral PublicKeyToken=null';
    this.formExtendBackupPackage.serviceType = 14;
    this.formExtendBackupPackage.actionType = 3;
    this.formExtendBackupPackage.serviceInstanceId = this.packageBackupModel?.id;
    this.formExtendBackupPackage.newExpireDate = this.estimateExpiredDate;
    this.formExtendBackupPackage.userEmail = this.tokenService.get()?.email;
    this.formExtendBackupPackage.actorEmail = this.tokenService.get()?.email;
  }

  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;

  getTotalAmount() {
    this.isLoadingAction = true;
    this.backupPackageInit();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.formExtendBackupPackage);
    itemPayment.specificationType = 'backuppacket_extend';
    itemPayment.sortItem = 0;
    itemPayment.serviceDuration = this.validateForm.controls.time.value;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.instanceService.getTotalAmount(dataPayment).subscribe((result) => {
      this.isLoadingAction = false;
      console.log('thanh tien backup package', result.data);
      this.orderItem = result.data;
      this.unitPrice = this.orderItem.orderItemPrices[0].unitPrice.amount;
      this.estimateExpiredDate = this.orderItem.orderItemPrices[0].expiredDate;
    });
  }

  typeVPC: number;

  ngOnInit() {
    this.idBackupPackage = Number.parseInt(this.route.snapshot.paramMap.get('id'));
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    // this.customerId = this.tokenService.get()?.userId
    // this.onChangeTime();

    if (this.idBackupPackage) {
      this.getDetailPackageBackup(this.idBackupPackage);

      // this.getTotalAmount()
    }
  }
}
