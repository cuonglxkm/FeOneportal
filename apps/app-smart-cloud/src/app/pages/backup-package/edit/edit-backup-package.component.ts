import { Component, Inject, OnInit } from '@angular/core';
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
import { ProjectService } from 'src/app/shared/services/project.service';
import { ConfigurationsService } from '../../../shared/services/configurations.service';
import { debounceTime, Subject } from 'rxjs';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { OrderService } from '../../../shared/services/order.service';

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
    this.router.navigate(['/app-smart-cloud/backup/packages']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    // this.getConfiguration();
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/backup/packages']);
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
    this.packageBackupService.detail(id).subscribe(data => {
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
    console.log('size', this.packageBackupModel.sizeInGB)
    if(this.packageBackupModel?.sizeInGB != null) {
      this.formUpdateBackupPackageModel.newSize = this.storage + this.packageBackupModel?.sizeInGB
    } else {
      this.formUpdateBackupPackageModel.newSize = this.storage
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
    request.note = 'cập nhật gói backup';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.formUpdateBackupPackageModel),
        specificationType: 'backuppacket_resize',
        price: this.orderItem?.totalPayment?.amount,
        serviceDuration: 0
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
        this.navigateToPaymentSummary(request);
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


  ngOnInit() {
    this.getConfiguration();
    this.idBackupPackage = Number.parseInt(this.route.snapshot.paramMap.get('id'));
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.onChangeStorage();
    if (this.idBackupPackage) {
      this.getDetailPackageBackup(this.idBackupPackage);

    }
  }
}
