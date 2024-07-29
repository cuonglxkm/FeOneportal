import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PackageBackupService } from '../../../shared/services/package-backup.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import {
  BackupPackageRequestModel,
  FormExtendBackupPackageModel, OrderItemTotalAmount,
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
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

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

  timeSelected: any;

  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

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
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.router.navigate(['/app-smart-cloud/backup/packages']);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/backup/packages']);
  }

  changeTime(value) {
    console.log('time', value)
    this.validateForm.controls.time.setValue(value);
    this.getTotalAmount();
  }

  // onChangeTime() {
  //   this.dataSubjectTime.subscribe(res => {
  //     console.log(res)
  //     if(res == 0) {
  //       this.timeSelected = 1
  //     } else {
  //       this.timeSelected = res;
  //     }
  //     this.validateForm.controls.time.setValue(this.timeSelected);
  //     this.getTotalAmount();
  //   })
  //
  //
  // }

  getDetailPackageBackup(id) {
    this.isLoading = true;
    this.packageBackupService.detail(id, this.project).subscribe(data => {
      this.isLoading = false;
      console.log('data', data);
      this.packageBackupModel = data;
      this.getTotalAmount();
    });
  }

  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  closePopupError() {
    this.isVisiblePopupError = false;
  }

  navigateToPaymentSummary() {
    this.isLoadingAction = true;
    this.getTotalAmount();
    let request: BackupPackageRequestModel = new BackupPackageRequestModel();
    request.customerId = this.formExtendBackupPackage.customerId;
    request.createdByUserId = this.formExtendBackupPackage.customerId;
    request.note = this.i18n.fanyi('app.backup.package.breadcrumb.extend');
    request.totalPayment = this.orderItem?.totalPayment?.amount
    request.totalVAT = this.orderItem?.totalVAT?.amount
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
        if(this.hasRoleSI) {
          this.packageBackupService.createOrder(request).subscribe(data => {
              if (data != null) {
                if (data.code == 200) {
                  this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.notification.request.extend.success'));
                  this.router.navigate(['/app-smart-cloud/volumes']);
                }
              } else {
                this.isLoadingAction = false;
              }
            },
            error => {
              this.isLoadingAction = false;
              this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.request.extend.fail'));
            });
        } else {
          var returnPath: string = '/app-smart-cloud/backup/packages/extend/' + this.idBackupPackage;
          console.log('request', request);
          this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request, path: returnPath } });
        }
      } else {
        this.isVisiblePopupError = true;
        this.errorList = data.data;
      }
    }, error => {
      this.isLoadingAction = false;
      console.log('error', error);
      this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.detail);
    });
  }

  formExtendBackupPackage: FormExtendBackupPackageModel = new FormExtendBackupPackageModel();

  backupPackageInit() {
    this.formExtendBackupPackage.regionId = this.region;
    this.formExtendBackupPackage.serviceName = this.packageBackupModel?.packageName;
    this.formExtendBackupPackage.customerId = this.packageBackupModel?.customerId;
    this.formExtendBackupPackage.projectId = this.project;
    this.formExtendBackupPackage.vpcId = this.project.toString();
    this.formExtendBackupPackage.typeName = 'SharedKernel.IntegrationEvents.Orders.Specifications.GenericExtendSpecificaton,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    this.formExtendBackupPackage.serviceType = 14;
    this.formExtendBackupPackage.actionType = 3;
    this.formExtendBackupPackage.serviceInstanceId = this.packageBackupModel?.id;
    // this.formExtendBackupPackage.newExpireDate = this.estimateExpiredDate;
    this.formExtendBackupPackage.userEmail = this.tokenService.get()?.email;
    this.formExtendBackupPackage.actorEmail = this.tokenService.get()?.email;


  }

  orderItem: OrderItem;
  unitPrice = 0;

  getTotalAmount() {
    this.isLoadingAction = true;
    this.backupPackageInit();
    let orderItemTotalAmount = new OrderItemTotalAmount();
    orderItemTotalAmount.orderItems = [
      {
        orderItemQuantity: 1,
        specificationString: JSON.stringify(this.formExtendBackupPackage),
        specificationType: 'backuppacket_extend',
        serviceDuration: this.validateForm.controls.time.value
      }
    ]
    orderItemTotalAmount.customerId = this.tokenService.get()?.userId
    orderItemTotalAmount.projectId = this.project
    this.packageBackupService.getTotalAmount(orderItemTotalAmount).subscribe((result) => {
      this.isLoadingAction = false;
      console.log('thanh tien backup package', result.data);
      this.orderItem = result.data;
      this.unitPrice = this.orderItem.orderItemPrices[0].unitPrice.amount;
      this.estimateExpiredDate = this.orderItem.orderItemPrices[0].expiredDate;
    });
  }

  typeVPC: number;

  getMonthDifference(expiredDateStr: string, createdDateStr: string): { months: number, days: number } {
    // Chuyển đổi chuỗi thành đối tượng Date
    const expiredDate = new Date(expiredDateStr);
    const createdDate = new Date(createdDateStr);

    // Tính số tháng giữa hai ngày
    const oneDay = 24 * 60 * 60 * 1000; // Số mili giây trong một ngày
    const diffDays = Math.round(Math.abs((expiredDate.getTime() - createdDate.getTime()) / oneDay)); // Số ngày chênh lệch
    const diffMonths = Math.floor(diffDays / 30); // Số tháng dựa trên số ngày, mỗi tháng có 30 ngày
    const remainingDays = diffDays % 30;
    return {
      months: diffMonths,
      days: remainingDays
    };
  }

  getFormattedDateDifference(expireDate: string, createdDate: string): string {
    const diff = this.getMonthDifference(expireDate, createdDate);
    if(diff.months == 0) {
      return `${diff.days} ` +  this.i18n.fanyi('app.day')
    } else if (diff.days == 0) {
      return `${diff.months} ` +  this.i18n.fanyi('app.months')
    } else {
      return `${diff.months} ` + this.i18n.fanyi('app.months') +  ` ${diff.days} ` +  this.i18n.fanyi('app.day');
    }
  }


  hasRoleSI: boolean;
  ngOnInit() {
    this.idBackupPackage = Number.parseInt(this.route.snapshot.paramMap.get('id'));
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.hasRoleSI = localStorage.getItem('role').includes('SI');
    if (this.idBackupPackage) {
      this.getDetailPackageBackup(this.idBackupPackage);
    }
  }
}
