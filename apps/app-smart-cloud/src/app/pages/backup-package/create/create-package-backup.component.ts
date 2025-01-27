import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PackageBackupService } from '../../../shared/services/package-backup.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { OrderItem } from '../../../shared/models/price';
import { DataPayment, ItemPayment } from '../../instances/instances.model';
import { InstancesService } from '../../instances/instances.service';
import { BackupPackageRequestModel, FormCreateBackupPackage } from 'src/app/shared/models/package-backup.model';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { ConfigurationsService } from '../../../shared/services/configurations.service';
import { debounceTime, Subject } from 'rxjs';
import { OrderService } from '../../../shared/services/order.service';
import {
  ProjectSelectDropdownComponent
} from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

/**
 *  Khởi tạo gói backup: Chỉ tạo ở dự án mặc định hoặc dự án ngoài vpc
 *
 * **/
@Component({
  selector: 'one-portal-create-package-backup',
  templateUrl: './create-package-backup.component.html',
  styleUrls: ['./create-package-backup.component.less']
})
export class CreatePackageBackupComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  typeVPC: number;

  validateForm: FormGroup<{
    namePackage: FormControl<string>
    storage: FormControl<number>
    description: FormControl<string>
    time: FormControl<number>
  }> = this.fb.group({
    namePackage: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9]*$/),
      Validators.maxLength(70), this.duplicateNameValidator.bind(this)]],
    storage: [0, [Validators.required]],
    description: [null as string, [Validators.maxLength(255)]],
    time: [1, [Validators.required]]
  });

  namePackage: string = '';
  storage: number = 1;

  isLoading: boolean = false;
  isLoadingAction: boolean = false;

  timeSelected: any;

  minStorage: number = 0;
  maxStorage: number = 0;
  stepStorage: number = 0;

  dataSubjectStorage: Subject<any> = new Subject<any>();
  formCreateBackupPackage: FormCreateBackupPackage = new FormCreateBackupPackage();
  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;

  nameList: string[] = [];

  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private instanceService: InstancesService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private configurationsService: ConfigurationsService,
              private orderService: OrderService) {
  }

  //check trung ten cua goi backup
  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null; // Name is unique
    }
  }


  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if (this.projectCombobox) {
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

  //Lay config tao voi block
  getConfiguration() {
    this.configurationsService.getConfigurations('BLOCKSTORAGE').subscribe(data => {
      let valueString = data.valueString;
      const arr = valueString.split('#');
      this.minStorage = Number.parseInt(arr[0]);
      this.stepStorage = Number.parseInt(arr[1]);
      this.maxStorage = Number.parseInt(arr[2]);
      // this.validateForm.controls.storage.setValue(this.minStorage)
    });
  }

  //change storage
  changeValueStorage(value) {
    this.dataSubjectStorage.next(value);
  }

  onChangeStorage() {
    this.dataSubjectStorage.pipe(debounceTime(500))
      .subscribe((res) => {
        if ((res % this.stepStorage) > 0) {
          this.notification.warning('', this.i18n.fanyi('app.notify.amount.capacity', { number: this.stepStorage }));
          this.validateForm.controls.storage.setValue(res - (res % this.stepStorage));
        }
        this.getTotalAmount();
      });
  }

  //change time
  timeSelectedChange(value) {
    this.timeSelected = value;
    if (value == 0) {
      this.validateForm.controls.time.setValue(1);
    } else {
      this.validateForm.controls.time.setValue(this.timeSelected);
    }
    console.log(this.timeSelected);
    this.getTotalAmount();
  }

  // lay danh sach goi backup de check trùng tên
  getAllBackupPackage() {
    this.packageBackupService.search(null, null, this.project, this.region, 9999, 1).subscribe(data => {
      data.records.forEach((item) => {
        if (this.nameList.length > 0) {
          this.nameList.push(item.packageName);
        } else {
          this.nameList = [item.packageName];
        }
      });
    }, error => {
      this.nameList = [];
    });
  }

  //init du lieu spec tao goi backup
  packageBackupInit() {
    if (this.validateForm.get('namePackage').value) {
      this.formCreateBackupPackage.packageName = this.validateForm.get('namePackage').value.trimStart().trimEnd();
    }
    if (this.validateForm.get('storage').value) {
      this.formCreateBackupPackage.sizeInGB = this.validateForm.get('storage').value;
    }
    if (this.validateForm.get('description').value) {
      this.formCreateBackupPackage.description = this.validateForm.get('description').value.trimStart().trimEnd();
    }
    this.formCreateBackupPackage.vpcId = this.project.toString();
    this.formCreateBackupPackage.oneSMEAddonId = null;
    this.formCreateBackupPackage.serviceType = 14;
    this.formCreateBackupPackage.serviceInstanceId = 0;
    this.formCreateBackupPackage.customerId = this.tokenService.get()?.userId;
    this.formCreateBackupPackage.saleDept = null;
    this.formCreateBackupPackage.saleDeptCode = null;
    this.formCreateBackupPackage.contactPersonEmail = null;
    this.formCreateBackupPackage.contactPersonPhone = null;
    this.formCreateBackupPackage.contactPersonName = null;
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
      'SharedKernel.IntegrationEvents.Orders.Specifications.BackupPackageCreateSpecificationSharedKernel.IntegrationEvents Version=1.0.0.0 Culture=neutral PublicKeyToken=null';
    this.formCreateBackupPackage.userEmail = this.tokenService.get()?.email;
    this.formCreateBackupPackage.actorEmail = this.tokenService.get()?.email;
  }

  isVisiblePopupError: boolean = false;
  errorList: string[] = [];

  closePopupError() {
    this.isVisiblePopupError = false;
  }

  onKeyDown(event: KeyboardEvent) {
    console.log('event', event)
    if (event.key === 'Enter' &&
      (this.isLoadingAction
        || this.validateForm.invalid
        || this.validateForm.controls.storage.value == 0
        || this.validateForm.controls.time.value == 0
        || this.validateForm.controls.storage.value % this.stepStorage > 0)) {
      event.preventDefault(); // Prevent default action if conditions are met
    }
  }

  navigateToPaymentSummary() {
    this.isLoadingAction = true;
    this.getTotalAmount();
    if (this.validateForm.valid) {
      let request: BackupPackageRequestModel = new BackupPackageRequestModel();
      request.customerId = this.formCreateBackupPackage.customerId;
      request.createdByUserId = this.formCreateBackupPackage.customerId;
      request.note = this.i18n.fanyi('app.backup.package.breadcrumb.create.backup.package');
      request.totalPayment = this.orderItem?.totalPayment?.amount;
      request.totalVAT = this.orderItem?.totalVAT?.amount;
      request.orderItems = [
        {
          orderItemQuantity: 1,
          specification: JSON.stringify(this.formCreateBackupPackage),
          specificationType: 'backuppackage_create',
          price: this.orderItem?.totalAmount?.amount,
          serviceDuration: this.validateForm.get('time').value
        }
      ];
      this.orderService.validaterOrder(request).subscribe(data => {
        this.isLoadingAction = false;
        if (data.success) {
          if (this.hasRoleSI) {
            this.packageBackupService.createOrder(request).subscribe(data => {
                if (data != null) {
                  if (data.code == 200) {
                    this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.notification.request.create.success'));
                    this.router.navigate(['/app-smart-cloud/volumes']);
                  }
                } else {
                  this.isLoadingAction = false;
                }
              },
              error => {
                this.isLoadingAction = false;
                this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.request.create.fail'));
              });
          } else {
            var returnPath: string = '/app-smart-cloud/backup/packages/create';
            console.log('request', request);
            this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request, path: returnPath } });
          }
        } else {
          this.isVisiblePopupError = true;
          this.errorList = data.data;
        }
      }, error => {
        console.log('error', error);
        this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.detail);
      });
    } else {
      this.notification.warning('', this.i18n.fanyi('app.notification.warning.input'));
    }

  }

  //Lay gia tien
  getTotalAmount() {
    this.isLoadingAction = true;
    this.packageBackupInit();
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
      this.isLoadingAction = false;
      this.orderItem = result.data;
      this.unitPrice = this.orderItem?.orderItemPrices[0]?.unitPrice.amount;
    });
  }

  hasRoleSI: boolean;

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.hasRoleSI = localStorage.getItem('role').includes('SI');

    this.getTotalAmount();
    this.getConfiguration();
    this.onChangeStorage();
    this.getAllBackupPackage();
  }
}


