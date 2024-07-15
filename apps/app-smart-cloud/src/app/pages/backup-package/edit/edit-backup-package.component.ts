import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PackageBackupService } from '../../../shared/services/package-backup.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import {
  BackupPackageRequestModel,
  FormUpdateBackupPackageModel,
  PackageBackupModel
} from '../../../shared/models/package-backup.model';
import { OrderItem } from '../../../shared/models/price';
import { DataPayment, ItemPayment } from '../../instances/instances.model';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { ConfigurationsService } from '../../../shared/services/configurations.service';
import { debounceTime, Subject } from 'rxjs';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { OrderService } from '../../../shared/services/order.service';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

@Component({
  selector: 'one-portal-extend-backup-package',
  templateUrl: './edit-backup-package.component.html',
  styleUrls: ['./edit-backup-package.component.less']
})
export class EditBackupPackageComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  idBackupPackage: number;

  validateForm: FormGroup<{
    storage: FormControl<number>
  }> = this.fb.group({
    storage: [0, [Validators.required, Validators.pattern(/^[0-9]*$/)]]
  });

  isLoading: boolean = true;
  packageBackupModel: PackageBackupModel;
  isLoadingButton: boolean = false;

  storage: number = 0;

  resizeDate: Date;

  minStorage: number = 0;
  maxStorage: number = 0;
  stepStorage: number = 0;

  dataSubjectStorage: Subject<any> = new Subject<any>();
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder,
              private configurationsService: ConfigurationsService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private orderService: OrderService) {
  }

  regionChanged(region: RegionModel) {
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
    // this.getConfiguration();
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/backup/packages']);
  }

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
    if (diff.months == 0) {
      return `${diff.days} ` + this.i18n.fanyi('app.day');
    } else if (diff.days == 0) {
      return `${diff.months} ` + this.i18n.fanyi('app.months');
    } else {
      return `${diff.months} ` + this.i18n.fanyi('app.months') + ` ${diff.days} ` + this.i18n.fanyi('app.day');
    }
  }

  getConfiguration() {
    this.configurationsService.getConfigurations('BLOCKSTORAGE').subscribe(data => {
      let valueString = data.valueString;
      const arr = valueString.split('#');
      this.minStorage = Number.parseInt(arr[0]);
      this.stepStorage = Number.parseInt(arr[1]);
      this.maxStorage = Number.parseInt(arr[2]);
    });
  }

  changeValueStorage(value) {
    this.dataSubjectStorage.next(value);
  }

  onChangeStorage() {
    this.dataSubjectStorage.pipe(debounceTime(500))
      .subscribe((res) => {
        if (res % this.stepStorage > 0) {
          this.notification.warning('', this.i18n.fanyi('app.notify.amount.capacity', { number: this.stepStorage }));
          this.storage = this.storage - (res % this.stepStorage);
          // this.validateForm.controls.storage.setValue(this.storage - (this.storage % this.stepStorage))
        }
        this.getTotalAmount();
      });
  }

  getDetailPackageBackup(id) {
    this.isLoading = true;
    this.packageBackupService.detail(id, this.project).subscribe(data => {
      this.isLoading = false;
      console.log('data', data);
      this.packageBackupModel = data;
      // this.storage = this.packageBackupModel?.sizeInGB;
      // this.validateForm.controls.storage.setValue(this.packageBackupModel?.sizeInGB);
      // this.getTotalAmount();
    }, error => {
      this.isLoading = false;
      this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.detail);
    });
  }


  formUpdateBackupPackageModel: FormUpdateBackupPackageModel = new FormUpdateBackupPackageModel();

  backupPackageInit() {
    this.formUpdateBackupPackageModel.packageName = this.packageBackupModel.packageName;
    console.log('size', this.packageBackupModel.sizeInGB);
    if (this.packageBackupModel?.sizeInGB != null) {
      this.formUpdateBackupPackageModel.newSize = this.storage + this.packageBackupModel?.sizeInGB;
    } else {
      this.formUpdateBackupPackageModel.newSize = this.storage;
    }
    this.formUpdateBackupPackageModel.description = this.packageBackupModel.description;
    this.formUpdateBackupPackageModel.vpcId = this.project.toString();
    this.formUpdateBackupPackageModel.serviceType = 14;
    this.formUpdateBackupPackageModel.serviceInstanceId = this.idBackupPackage;
    this.formUpdateBackupPackageModel.customerId = this.tokenService.get()?.userId;

    this.formUpdateBackupPackageModel.actionType = 4;
    this.formUpdateBackupPackageModel.regionId = this.region;
    this.formUpdateBackupPackageModel.serviceName = this.packageBackupModel.packageName;
    this.formUpdateBackupPackageModel.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.BackupPackageCreateSpecificationSharedKernel.IntegrationEvents Version=1.0.0.0 Culture=neutral PublicKeyToken=null';
    this.formUpdateBackupPackageModel.userEmail = this.tokenService.get()?.email;
    this.formUpdateBackupPackageModel.actorEmail = this.tokenService.get()?.email;
  }

  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;

  getTotalAmount() {
    this.isLoadingButton = true;
    this.backupPackageInit();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.formUpdateBackupPackageModel);
    itemPayment.specificationType = 'backuppacket_resize';
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.orderService.getTotalAmount(dataPayment).subscribe((result) => {
      this.isLoadingButton = false;
      this.orderItem = result.data;
      this.unitPrice = this.orderItem?.orderItemPrices[0].unitPrice.amount;
    });
  }

  isVisiblePopupError: boolean = false;
  errorList: string[] = [];

  closePopupError() {
    this.isVisiblePopupError = false;
  }

  formOrder() {
    let request: BackupPackageRequestModel = new BackupPackageRequestModel();
    request.customerId = this.formUpdateBackupPackageModel.customerId;
    request.createdByUserId = this.formUpdateBackupPackageModel.customerId;
    request.note = this.i18n.fanyi('app.backup.package.resize');
    request.totalPayment = this.orderItem?.totalPayment?.amount;
    request.totalVAT = this.orderItem?.totalVAT?.amount;
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.formUpdateBackupPackageModel),
        specificationType: 'backuppacket_resize',
        price: this.orderItem?.totalAmount.amount,
        serviceDuration: 1
      }
    ];
    return request;
  }

  sendRequestOrder() {
    this.isLoadingButton = true;
    let request = this.formOrder();
    this.orderService.validaterOrder(request).subscribe(data => {
      this.isLoadingButton = false;
      console.log('data', data);
      if (data.success) {
        console.log('request', request);
        if(this.hasRoleSI) {
          this.packageBackupService.createOrder(request).subscribe(data => {
              if (data != null) {
                if (data.code == 200) {
                  this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.notification.request.resize.success'));
                  this.router.navigate(['/app-smart-cloud/volumes']);
                }
              } else {
                this.isLoadingButton = false;
              }
            },
            error => {
              this.isLoadingButton = false;
              this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.request.resize.fail'));
            });
        } else {
          this.navigateToPaymentSummary(request);
        }
      } else {
        this.isVisiblePopupError = true;
        this.errorList = data.data;
      }
      //
    }, error => {
      this.isLoadingButton = false;
      console.log('error', error);
      this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.detail);
    });
  }

  navigateToPaymentSummary(request) {
    var returnPath: string = '/app-smart-cloud/backup/packages/resize/' + this.idBackupPackage;
    console.log('request', request);
    this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request, path: returnPath } });
  }


  hasRoleSI: boolean;
  ngOnInit() {
    this.getConfiguration();
    this.idBackupPackage = Number.parseInt(this.route.snapshot.paramMap.get('id'));
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.hasRoleSI = localStorage.getItem('role').includes('SI');
    this.onChangeStorage();
    if (this.idBackupPackage) {
      this.getDetailPackageBackup(this.idBackupPackage);

    }
  }
}
