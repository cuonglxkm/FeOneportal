import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { addDays } from 'date-fns';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormCreateSnapshotPackage, FormSearchPackageSnapshot, SnapshotPackageRequestModel } from 'src/app/shared/models/package-snapshot.model';
import { PackageBackupService } from '../../../shared/services/package-backup.service';
import { DataPayment, ItemPayment } from '../../instances/instances.model';
import { InstancesService } from '../../instances/instances.service';
import { RegionID, ServiceActionType, ServiceType } from 'src/app/shared/enums/common.enum';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';
import { debounceTime, finalize, Subject } from 'rxjs';
import { OrderService } from '../../../shared/services/order.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { ConfigurationsService } from '../../../shared/services/configurations.service';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { SupportService } from 'src/app/shared/models/catalog.model';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { PackageSnapshotService } from 'src/app/shared/services/package-snapshot.service';

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
    Validators.pattern(/^[a-zA-Z0-9_]*$/),
    Validators.maxLength(50),this.duplicateNameValidator.bind(this)]],
    description: ['', [Validators.maxLength(255)]],
    time: [1, [Validators.required]]
  });

  namePackage: string = '';
  description: string = '';
  storage: number = 1;
  orderItem: any;
  unitPrice = 0;
  dateString = new Date();
  expiredDate: Date = addDays(this.dateString, 30);

  isLoading: boolean = false;
  private searchSubjectHdd = new Subject<string>();
  private searchSubjectSsd = new Subject<string>();
  private readonly debounceTimeMs = 500;
  totalAmount: number;
  totalPayment: number;
  totalVat: number;
  isVisiblePopupError: boolean = false;
  errorList: string[] = [];

  formCreateSnapshotPackage: FormCreateSnapshotPackage = new FormCreateSnapshotPackage();
  hddPrice = 0;
  hddUnitPrice = 0
  ssdPrice = 0;
  ssdUnitPrice = 0;
  numberHDD = 0;
  numberSSD = 0;
  loadingCalculate = false;

  minBlock: number = 0;
  stepBlock: number = 0;
  maxBlock: number = 0;
  private inputChangeBlock = new Subject<{ value: number, name: string }>();
  serviceActiveByRegion: SupportService[] = [];
  typeSnapshotHdd: boolean;
  typeSnapshotSsd: boolean;
  titleBreadcrumb:string;
  breadcrumbBlockStorage:string;
  nameList: string[] = [];
  formSearchPackageSnapshot: FormSearchPackageSnapshot = new FormSearchPackageSnapshot()
  closePopupError() {
    this.isVisiblePopupError = false;
  }
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(private router: Router,
    private packageSnapshotService: PackageSnapshotService,
    private orderService: OrderService,
    private configurationsService: ConfigurationsService,
    private packageBackupService: PackageBackupService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private fb: NonNullableFormBuilder,
    private catalogService: CatalogService,
    private instanceService: InstancesService) {
    this.validateForm.get('time').valueChanges.subscribe(data => {
      this.getTotalAmount();
    });
    this.inputChangeBlock.pipe(
      debounceTime(800)
    ).subscribe(data => this.checkNumberBlock(data.value, data.name));
  }
  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    if (!this.url.includes('advance')) {
      if (Number(localStorage.getItem('regionId')) === RegionID.ADVANCE) {
        this.region = RegionID.NORMAL;
      } else {
        this.region = Number(localStorage.getItem('regionId'));
      }
       this.titleBreadcrumb ='Dịch vụ hạ tầng'
        this.breadcrumbBlockStorage ='Block Storage'
    } else {
      this.region = RegionID.ADVANCE;
       this.titleBreadcrumb ='Dịch vụ nâng cao'
       this.breadcrumbBlockStorage ='Block Storage nâng cao'
    }
    // this.customerId = this.tokenService.get()?.userId
    console.log(this.tokenService.get());
    this.getStepBlock('BLOCKSTORAGE');
    this.getProductActivebyregion();
    this.getListPackageSnapshot();

  }
  // validate name khi nhap trung
  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true }; 
    } else {
      return null; 
    }
  }
  // call api get list package check validate name
  getListPackageSnapshot() {
    this.isLoading = true
    this.formSearchPackageSnapshot.projectId = this.project
    this.formSearchPackageSnapshot.regionId = this.region
    this.packageSnapshotService.getPackageSnapshot(this.formSearchPackageSnapshot)
      // .pipe(debounceTime(500))
      .subscribe(data => {
        data.records.forEach((item) => {
         
          if (this.nameList.length > 0) {
            this.nameList.push(item.packageName);
          } else {
            this.nameList = [item.packageName];
          }
        });
      }, (error) => {
        this.nameList = null;
      })
  }
  // call api get step block 
  getStepBlock(name: string) {
    this.configurationsService.getConfigurations(name).subscribe((res: any) => {
      const valuestring: any = res.valueString;
      const parts = valuestring.split("#")
      this.minBlock = parseInt(parts[0]);
      console.log("this.minBlock",this.minBlock)
      this.stepBlock = parseInt(parts[1]);
      console.log("this.stepBlock",this.stepBlock)
      this.maxBlock = parseInt(parts[2]);
      console.log("this.maxBlock",this.maxBlock)
      this.numberHDD = this.minBlock;
      this.numberSSD = this.minBlock;
    })
  }
  onInputChange(value: number, name: string): void {
    this.inputChangeBlock.next({ value, name });

  }
  // function check number input block
  checkNumberBlock(value: number, name: string): void {
    const messageStepNotification = `Số lượng phải chia hết cho  ${this.stepBlock} `;
    const numericValue = Number(value);
    if (isNaN(numericValue)) {
      this.notification.warning('', messageStepNotification);
      return;
    }
    let adjustedValue = Math.floor(numericValue / this.stepBlock) * this.stepBlock;
    if (adjustedValue > this.maxBlock) {
      adjustedValue = Math.floor(this.maxBlock / this.stepBlock) * this.stepBlock;
    } else if (adjustedValue < this.minBlock) {
      this.notification.warning('', messageStepNotification);
      adjustedValue = this.minBlock;

    }
    if (numericValue !== adjustedValue) {
      this.notification.warning('', messageStepNotification);
    }
    switch (name) {
      case "hhd":
        this.numberHDD = adjustedValue;
        break;
      case "ssd":
        this.numberSSD = adjustedValue;
        break;

    }
    if (numericValue !== adjustedValue) {
      this[name] = adjustedValue;
    }
    this.getTotalAmount();

  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if (this.projectCombobox) {
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.navigateToSnapshotPackage()
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }


  userChanged(project: ProjectModel) {
    this.navigateToSnapshotPackage()
  }

  navigateToSnapshotPackage() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/snapshot-advance/packages']);
    } else {
      this.router.navigate(['/app-smart-cloud/snapshot/packages']);
    }
  }
  navigateToBreadcrumb() {
    if (this.region === 7) {
      this.router.navigate(['/app-smart-cloud/snapshot-advance/packages']);
    } else {
      this.router.navigate(['/app-smart-cloud/snapshot/packages']);
    }
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
        if (data.success) {
          var returnPath: string = window.location.pathname;
          this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request, path: returnPath } });
        } else {
          this.isVisiblePopupError = true;
          this.errorList = data.data;
        }
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


 
  // ngDoCheck(){
  //   this.numberHDD = this.minBlock;
  // }

  packageBackupInit() {
    this.formCreateSnapshotPackage.packageName = this.validateForm.get('namePackage').value;

    this.formCreateSnapshotPackage.quotaHddSizeInGB = this.numberHDD;
    this.formCreateSnapshotPackage.quotaSsdSizeInGB = this.numberSSD;
    this.formCreateSnapshotPackage.description = this.validateForm.get('description').value;
    // this.formCreateSnapshotPackage.description = this.validateForm.get('description').value;
    this.formCreateSnapshotPackage.projectId = this.project;
    this.formCreateSnapshotPackage.vpcId = this.project?.toString();
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
    this.formCreateSnapshotPackage.description = this.validateForm.controls.description.value.trim();
    this.formCreateSnapshotPackage.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.SnapshotPackageCreateSpecification,SharedKernel.IntegrationEvents,Version=1.0.0.0,Culture=neutral,PublicKeyToken=null';
    this.formCreateSnapshotPackage.userEmail = this.tokenService.get()?.email;
    this.formCreateSnapshotPackage.actorEmail = this.tokenService.get()?.email;
    this.formCreateSnapshotPackage.type = 'HDD';
    this.formCreateSnapshotPackage.offerId = 0;
  }


  getTotalAmount() {
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
              this.hddPrice = item.totalAmount.amount;
              this.hddUnitPrice = item.unitPrice.amount;
            } else if (item.typeName == 'volume-snapshot-ssd') {
              this.ssdPrice = item.totalAmount.amount;
              this.ssdUnitPrice = item.unitPrice.amount;
            }
          }
        }
      });
  }

  url = window.location.pathname;


  onChangeTime($event: any) {

  }

  checkPossiblePress(event: KeyboardEvent) {
    const key = event.key;
    if (isNaN(Number(key)) && key !== 'Backspace' && key !== 'Delete' && key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Tab') {
      event.preventDefault();
    }
  }
  // check các dịch vụ theo region
  getProductActivebyregion() {
    const catalogs = ['ip', 'ipv6', 'volume-snapshot-hdd', 'volume-snapshot-ssd', 'backup-volume', 'loadbalancer-sdn', 'file-storage', 'file-storage-snapshot', 'vpns2s', 'vm-gpu']
    this.catalogService.getActiveServiceByRegion(catalogs, this.region).subscribe(data => {
      this.serviceActiveByRegion = data;
      this.serviceActiveByRegion.forEach((item: any) => {
        if (['volume-snapshot-hdd'].includes(item.productName)) {
          this.typeSnapshotHdd = item.isActive;
        }
        if (['volume-snapshot-ssd'].includes(item.productName)) {
          this.typeSnapshotSsd = item.isActive;
        }
      });
    });
  }

}


